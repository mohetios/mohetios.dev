import { GraphQLError } from 'graphql'

import type { GraphQLContext } from '../routes/graph'
import { createInboxMessage } from '../services/inbox/create-inbox-message'
import { deleteMessageForever } from '../services/inbox/delete-message-forever'
import { markMessageKind } from '../services/inbox/mark-message-kind'
import { markMessageStatus } from '../services/inbox/mark-message-status'
import { replyToMessage } from '../services/inbox/reply-to-message'
import { restoreMessage } from '../services/inbox/restore-message'
import { trashMessage } from '../services/inbox/trash-message'
import { normalizeInboxMessageRow } from '../utils/inbox-map'
import { createAdminNotification } from '../services/notifications/create-admin-notification'
import { requirePermission } from '../utils/auth'
import type { AdminNotificationJob } from '../../shared/contracts/notifications'

type ContactTopic = 'PROJECT' | 'CONSULTING' | 'COLLABORATION' | 'WRITING' | 'OTHER'
type InboxStatus = 'NEW' | 'OPEN' | 'REPLIED' | 'ARCHIVED' | 'SPAM'
type InboxKind = 'LEAD' | 'COLLABORATION' | 'PERSONAL' | 'SUPPORT' | 'OTHER' | 'SPAM'

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
  input: {
    id: string
    status: InboxStatus
  }
}

type UpdateInboxMessageKindArgs = {
  input: {
    id: string
    kind: InboxKind
  }
}

type ReplyToInboxMessageArgs = {
  input: {
    inboxMessageId: string
    bodyText: string
  }
}

const validTopics = new Set<ContactTopic>([
  'PROJECT',
  'CONSULTING',
  'COLLABORATION',
  'WRITING',
  'OTHER'
])

const validStatuses = new Set<InboxStatus>(['NEW', 'OPEN', 'REPLIED', 'ARCHIVED', 'SPAM'])
const validKinds = new Set<InboxKind>([
  'LEAD',
  'COLLABORATION',
  'PERSONAL',
  'SUPPORT',
  'OTHER',
  'SPAM'
])

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

function getContactKind(topic: string): InboxKind {
  if (topic === 'PROJECT' || topic === 'CONSULTING') return 'LEAD'
  if (topic === 'COLLABORATION' || topic === 'WRITING') return 'COLLABORATION'

  return 'OTHER'
}

function getContactSubject(topic: string, company: string | null) {
  const label = topic
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

  return company ? `${label} inquiry from ${company}` : `${label} inquiry`
}

function createNotificationPreview(value: string, maxLength = 140) {
  const preview = value.replace(/\s+/g, ' ').trim()

  if (preview.length <= maxLength) {
    return preview
  }

  return `${preview.slice(0, maxLength - 1).trim()}...`
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

    const message = await createInboxMessage(context.db, {
      source: 'CONTACT_FORM',
      kind: getContactKind(topic),
      senderName: name,
      senderEmail: email,
      subject: getContactSubject(topic, company),
      bodyText: body,
      senderCompany: company,
      senderWebsite: website
    })
    const notification = await createAdminNotification(context.db, {
      type: 'NEW_CONTACT_MESSAGE',
      title: 'New contact message',
      body: `${name}: ${createNotificationPreview(body)}`,
      url: `/dashboard/inbox?message=${message.id}`,
      entityType: 'inboxMessage',
      entityId: message.id
    })

    if (context.env.ADMIN_NOTIFICATION_QUEUE) {
      await context.env.ADMIN_NOTIFICATION_QUEUE.send({
        type: 'NEW_CONTACT_MESSAGE',
        inboxMessageId: message.id,
        notificationId: notification.id
      } satisfies AdminNotificationJob)
    } else {
      console.warn('ADMIN_NOTIFICATION_QUEUE binding is missing')
    }

    return message
  },

  updateInboxMessageStatus: async (
    _parent: unknown,
    args: UpdateInboxMessageStatusArgs,
    context: GraphQLContext
  ) => {
    requirePermission(context, 'inbox:manage')

    if (!validStatuses.has(args.input.status)) {
      throw new GraphQLError('Status is invalid')
    }

    const message = await markMessageStatus(context.db, args.input.id, args.input.status)

    if (!message) {
      throw new GraphQLError('Message not found')
    }

    return normalizeInboxMessageRow(message)
  },

  updateInboxMessageKind: async (
    _parent: unknown,
    args: UpdateInboxMessageKindArgs,
    context: GraphQLContext
  ) => {
    requirePermission(context, 'inbox:manage')

    if (!validKinds.has(args.input.kind)) {
      throw new GraphQLError('Kind is invalid')
    }

    const message = await markMessageKind(context.db, args.input.id, args.input.kind)

    if (!message) {
      throw new GraphQLError('Message not found')
    }

    return normalizeInboxMessageRow(message)
  },

  replyToInboxMessage: async (
    _parent: unknown,
    args: ReplyToInboxMessageArgs,
    context: GraphQLContext
  ) => {
    requirePermission(context, 'inbox:manage')

    const bodyText = normalizeText(args.input.bodyText, 10000, 'Reply')

    try {
      const reply = await replyToMessage(context.db, context.env, {
        inboxMessageId: args.input.inboxMessageId,
        bodyText
      })

      return {
        id: reply.id,
        status: reply.status,
        error: reply.error
      }
    } catch (error) {
      throw new GraphQLError(error instanceof Error ? error.message : 'Reply failed')
    }
  },

  trashInboxMessage: async (
    _parent: unknown,
    args: { id: string },
    context: GraphQLContext
  ) => {
    requirePermission(context, 'inbox:manage')

    const message = await trashMessage(context.db, args.id)

    if (!message) {
      throw new GraphQLError('Inbox message not found')
    }

    return normalizeInboxMessageRow(message)
  },

  restoreInboxMessage: async (
    _parent: unknown,
    args: { id: string },
    context: GraphQLContext
  ) => {
    requirePermission(context, 'inbox:manage')

    const message = await restoreMessage(context.db, args.id)

    if (!message) {
      throw new GraphQLError('Inbox message not found')
    }

    return normalizeInboxMessageRow(message)
  },

  deleteInboxMessageForever: async (
    _parent: unknown,
    args: { id: string },
    context: GraphQLContext
  ) => {
    requirePermission(context, 'inbox:manage')

    try {
      const result = await deleteMessageForever(context.db, args.id)

      if (!result.found) {
        throw new GraphQLError('Inbox message not found')
      }

      return {
        id: args.id,
        deleted: result.deleted
      }
    } catch (error) {
      throw new GraphQLError(error instanceof Error ? error.message : 'Delete failed')
    }
  }
}
