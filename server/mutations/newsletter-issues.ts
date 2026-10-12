import { eq } from 'drizzle-orm'
import { GraphQLError } from 'graphql'

import { newsletterIssues } from '../models/schema'
import type { GraphQLContext } from '../routes/graph'
import { requirePermission } from '../utils/auth'
import { createId } from '../utils/id'
import { newsletterIssueQueries } from '../queries/newsletter-issues'
import type { EmailDeliveryJob } from '../../shared/contracts/email'
import {
  NEWSLETTER_LOCALES,
  NEWSLETTER_TEMPLATES,
  type NewsletterLink,
  type NewsletterLocale,
  type NewsletterTemplate
} from '../../shared/utils/newsletter-email'

type SaveNewsletterIssueInput = {
  id?: string | null
  template: NewsletterTemplate
  locale: string
  subject: string
  preheader?: string | null
  heading: string
  intro: string
  items: NewsletterLink[]
  ctaLabel?: string | null
  ctaUrl?: string | null
  outro: string
  scheduledAt?: number | null
}

const MAX_ITEMS = 20
const EMAIL_RE = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/

function text(value: string | null | undefined, max: number, label: string, required = false) {
  const normalized = value?.trim() ?? ''

  if (required && !normalized) throw new GraphQLError(`${label} is required`)
  if (normalized.length > max) throw new GraphQLError(`${label} must be ${max} characters or less`)

  return normalized
}

function url(value: string | null | undefined, label: string, required = false) {
  const normalized = text(value, 2000, label, required)

  if (normalized && !/^https?:\/\/\S+$/.test(normalized)) {
    throw new GraphQLError(`${label} must start with http:// or https://`)
  }

  return normalized
}

function parseInput(input: SaveNewsletterIssueInput) {
  if (!NEWSLETTER_TEMPLATES.includes(input.template)) throw new GraphQLError('Unknown template')
  if (!NEWSLETTER_LOCALES.includes(input.locale as NewsletterLocale)) {
    throw new GraphQLError('Unknown locale')
  }
  if (input.items.length > MAX_ITEMS) {
    throw new GraphQLError(`An issue can have at most ${MAX_ITEMS} links`)
  }
  if (input.scheduledAt != null && !Number.isFinite(input.scheduledAt)) {
    throw new GraphQLError('Schedule time is invalid')
  }

  const ctaLabel = text(input.ctaLabel, 80, 'Button label')
  const ctaUrl = url(input.ctaUrl, 'Button link')

  if (Boolean(ctaLabel) !== Boolean(ctaUrl)) {
    throw new GraphQLError('Button needs both a label and a link')
  }

  return {
    template: input.template,
    locale: input.locale as NewsletterLocale,
    subject: text(input.subject, 150, 'Subject', true),
    preheader: text(input.preheader, 200, 'Preview text') || null,
    heading: text(input.heading, 200, 'Heading'),
    intro: text(input.intro, 20000, 'Body', true),
    items: input.items.map((item, index) => ({
      title: text(item.title, 200, `Link ${index + 1} title`, true),
      url: url(item.url, `Link ${index + 1} URL`, true),
      description: text(item.description, 600, `Link ${index + 1} description`) || null,
      meta: text(item.meta, 80, `Link ${index + 1} label`) || null
    })),
    ctaLabel: ctaLabel || null,
    ctaUrl: ctaUrl || null,
    outro: text(input.outro, 5000, 'Closing'),
    status: input.scheduledAt == null ? ('DRAFT' as const) : ('SCHEDULED' as const),
    scheduledAt: input.scheduledAt ?? null
  }
}

async function getEditableIssue(context: GraphQLContext, id: string) {
  const [issue] = await context.db
    .select({ id: newsletterIssues.id, status: newsletterIssues.status })
    .from(newsletterIssues)
    .where(eq(newsletterIssues.id, id))
    .limit(1)

  if (!issue) throw new GraphQLError('Issue not found')
  if (issue.status === 'SENDING' || issue.status === 'SENT') {
    throw new GraphQLError('This issue has already been sent')
  }

  return issue
}

export const newsletterIssueMutations = {
  saveNewsletterIssue: async (
    _parent: unknown,
    args: { input: SaveNewsletterIssueInput },
    context: GraphQLContext
  ) => {
    requirePermission(context, 'newsletter:manage')

    const values = parseInput(args.input)
    const now = Date.now()
    let id = args.input.id

    if (id) {
      await getEditableIssue(context, id)
      await context.db
        .update(newsletterIssues)
        .set({ ...values, updatedAt: now })
        .where(eq(newsletterIssues.id, id))
    } else {
      id = createId()
      await context.db
        .insert(newsletterIssues)
        .values({ id, ...values, createdAt: now, updatedAt: now })
    }

    return newsletterIssueQueries.newsletterIssue(undefined, { id }, context)
  },

  deleteNewsletterIssue: async (
    _parent: unknown,
    args: { id: string },
    context: GraphQLContext
  ) => {
    requirePermission(context, 'newsletter:manage')

    await getEditableIssue(context, args.id)
    await context.db.delete(newsletterIssues).where(eq(newsletterIssues.id, args.id))

    return true
  },

  sendNewsletterTest: async (
    _parent: unknown,
    args: { id: string; email?: string | null },
    context: GraphQLContext
  ) => {
    requirePermission(context, 'newsletter:manage')

    const toEmail = text(args.email, 254, 'Email') || context.env.NUXT_MAIL_FROM

    if (!EMAIL_RE.test(toEmail)) throw new GraphQLError('Email must be valid')
    if (!context.env.EMAIL_DELIVERY_QUEUE)
      throw new GraphQLError('Email delivery is not configured')

    await context.env.EMAIL_DELIVERY_QUEUE.send({
      type: 'SEND_NEWSLETTER_TEST',
      issueId: args.id,
      toEmail
    } satisfies EmailDeliveryJob)

    return true
  }
}
