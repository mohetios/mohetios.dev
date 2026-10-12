import { and, desc, eq, like, or, sql, type SQL } from 'drizzle-orm'

import { newsletterSubscribers } from '../models/schema'
import type { GraphQLContext } from '../routes/graph'
import { requirePermission } from '../utils/auth'
import {
  normalizeNewsletterSubscriberRow,
  type NewsletterSubscriberStatus
} from '../utils/newsletter-map'

type NewsletterSubscribersFilterInput = {
  status?: NewsletterSubscriberStatus | null
  search?: string | null
  limit?: number | null
  offset?: number | null
}

const graphqlToDbStatus: Record<
  NewsletterSubscriberStatus,
  (typeof newsletterSubscribers.$inferSelect)['status']
> = {
  PENDING: 'pending',
  SUBSCRIBED: 'subscribed',
  UNSUBSCRIBED: 'unsubscribed',
  BOUNCED: 'bounced',
  COMPLAINED: 'complained'
}

function clampLimit(value?: number | null) {
  const limit = value ?? 50
  return Math.min(Math.max(limit, 1), 100)
}

function clampOffset(value?: number | null) {
  const offset = value ?? 0
  return Math.max(offset, 0)
}

function buildStatusCondition(status?: NewsletterSubscriberStatus | null): SQL | undefined {
  if (!status) return undefined

  return eq(newsletterSubscribers.status, graphqlToDbStatus[status])
}

function buildSearchCondition(search?: string | null): SQL | undefined {
  const query = search?.trim()

  if (!query) return undefined

  const pattern = `%${query}%`

  return or(
    like(newsletterSubscribers.email, pattern),
    like(newsletterSubscribers.name, pattern),
    like(newsletterSubscribers.source, pattern)
  )
}

async function getSummary(db: GraphQLContext['db']) {
  const status = newsletterSubscribers.status
  const [row] = await db
    .select({
      total: sql<number>`count(*)`.mapWith(Number),
      subscribed: sql<number>`count(*) filter (where ${status} = 'subscribed')`.mapWith(Number),
      pending: sql<number>`count(*) filter (where ${status} = 'pending')`.mapWith(Number),
      unsubscribed: sql<number>`count(*) filter (where ${status} = 'unsubscribed')`.mapWith(Number)
    })
    .from(newsletterSubscribers)

  return row ?? { total: 0, subscribed: 0, pending: 0, unsubscribed: 0 }
}

export const newsletterSubscribersQuery = async (
  _parent: unknown,
  args: { input?: NewsletterSubscribersFilterInput | null },
  context: GraphQLContext
) => {
  requirePermission(context, 'newsletter:manage')

  const limit = clampLimit(args.input?.limit)
  const offset = clampOffset(args.input?.offset)
  const filters = and(
    buildStatusCondition(args.input?.status),
    buildSearchCondition(args.input?.search)
  )

  const [countRows, rows, summary] = await Promise.all([
    context.db
      .select({ count: sql<number>`count(*)` })
      .from(newsletterSubscribers)
      .where(filters),
    context.db
      .select()
      .from(newsletterSubscribers)
      .where(filters)
      .orderBy(desc(newsletterSubscribers.createdAt))
      .limit(limit)
      .offset(offset),
    getSummary(context.db)
  ])

  return {
    items: rows.map(normalizeNewsletterSubscriberRow),
    total: Number(countRows[0]?.count ?? 0),
    limit,
    offset,
    summary
  }
}
