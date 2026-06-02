import { eq } from 'drizzle-orm'
import { GraphQLError } from 'graphql'

import { inboxMessages } from '../models/schema'
import type { GraphQLContext } from '../routes/graph'
import { requirePermission } from '../utils/auth'
import { createId } from '../utils/id'

type ContactTopic = 'PROJECT' | 'CONSULTING' | 'COLLABORATION' | 'WRITING' | 'OTHER'
type InboxStatus = 'UNREAD' | 'READ' | 'ARCHIVED' | 'SPAM'
type InboxCategory = 'LEAD' | 'JOB' | 'FREELANCE' | 'GENERAL' | 'SYSTEM'

type CreateContactMessageArgs = {
  input: {
    name: string
    email: string
    topic: ContactTopic | string
    message: string
    turnstileToken: string
    website?: string | null
    company?: string | null
  }
}

type UpdateInboxMessageStatusArgs = {
  id: string
  status: InboxStatus
}

const validTopics = new Set<ContactTopic>([
  'PROJECT',
  'CONSULTING',
  'COLLABORATION',
  'WRITING',
  'OTHER'
])

const validStatuses = new Set<InboxStatus>(['UNREAD', 'READ', 'ARCHIVED', 'SPAM'])

function normalizeText(value: string, maxLength: number, label: string) {
  const normalized = value.trim()

  if (!normalized) {
    throw new GraphQLError(`${label} is required`)
  }

  if (normalized.length > maxLength) {
    throw new GraphQLError(`${label} must be ${maxLength} characters or less`)
  }

  return normalized
}

function normalizeOptionalText(value: string | null | undefined, maxLength: number, label: string) {
  const normalized = value?.trim() || null

  if (normalized && normalized.length > maxLength) {
    throw new GraphQLError(`${label} must be ${maxLength} characters or less`)
  }

  return normalized
}

function normalizeEmail(value: string) {
  const email = normalizeText(value, 254, 'Email')

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new GraphQLError('Email must be valid')
  }

  return email.toLowerCase()
}

function normalizeUrl(value: string | null | undefined) {
  const url = normalizeOptionalText(value, 500, 'Website')

  if (url) {
    try {
      new URL(url)
    } catch {
      throw new GraphQLError('Website must be a valid URL')
    }
  }

  return url
}

function getContactCategory(topic: string): InboxCategory {
  if (topic === 'PROJECT' || topic === 'CONSULTING') return 'LEAD'
  if (topic === 'COLLABORATION' || topic === 'WRITING') return 'FREELANCE'

  return 'GENERAL'
}

function getContactSubject(topic: string, company: string | null) {
  const label = topic
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

  return company ? `${label} inquiry from ${company}` : `${label} inquiry`
}

async function verifyContactTurnstile(token: string, context: GraphQLContext) {
  const normalizedToken = normalizeText(token, 2048, 'Verification token')
  const result = await verifyTurnstileToken(normalizedToken, context.event)

  if (!result.success) {
    throw new GraphQLError('Verification failed. Please try again.')
  }
}

export const inboxMutations = {
  createContactMessage: async (
    _parent: unknown,
    args: CreateContactMessageArgs,
    context: GraphQLContext
  ) => {
    const name = normalizeText(args.input.name, 120, 'Name')
    const email = normalizeEmail(args.input.email)
    const topic = normalizeText(args.input.topic, 40, 'Topic').toUpperCase()
    const body = normalizeText(args.input.message, 5000, 'Message')
    const company = normalizeOptionalText(args.input.company, 160, 'Company')
    const website = normalizeUrl(args.input.website)

    await verifyContactTurnstile(args.input.turnstileToken, context)

    if (!validTopics.has(topic as ContactTopic)) {
      throw new GraphQLError('Topic is invalid')
    }

    const now = new Date().toISOString()
    const preview = body.length > 160 ? `${body.slice(0, 157).trimEnd()}...` : body
    const message = {
      id: createId(),
      channel: 'CONTACT_FORM' as const,
      status: 'UNREAD' as const,
      category: getContactCategory(topic),
      fromName: name,
      fromEmail: email,
      subject: getContactSubject(topic, company),
      preview,
      body,
      topic,
      company,
      website,
      source: 'contact form',
      createdAt: now,
      updatedAt: now
    }

    const [created] = await context.db.insert(inboxMessages).values(message).returning()

    return created
  },

  updateInboxMessageStatus: async (
    _parent: unknown,
    args: UpdateInboxMessageStatusArgs,
    context: GraphQLContext
  ) => {
    requirePermission(context, 'inbox:manage')

    if (!validStatuses.has(args.status)) {
      throw new GraphQLError('Status is invalid')
    }

    const [message] = await context.db
      .update(inboxMessages)
      .set({
        status: args.status,
        updatedAt: new Date().toISOString()
      })
      .where(eq(inboxMessages.id, args.id))
      .returning()

    if (!message) {
      throw new GraphQLError('Message not found')
    }

    return message
  }
}
