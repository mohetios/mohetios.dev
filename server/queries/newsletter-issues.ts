import { desc, eq, getTableColumns, sql } from 'drizzle-orm'

import { newsletterIssues, newsletterSubscribers } from '../models/schema'
import type { GraphQLContext } from '../routes/graph'
import { requirePermission } from '../utils/auth'
import { NEWSLETTER_FALLBACK_LOCALE } from '../../shared/utils/newsletter-email'

const ISSUES_LIMIT = 50

const deliveryCount = (status: 'SENT' | 'FAILED') =>
  sql<number>`(select count(*) from newsletter_deliveries d where d.issue_id = ${newsletterIssues.id} and d.status = ${status})`.mapWith(
    Number
  )

const issueColumns = {
  ...getTableColumns(newsletterIssues),
  sentCount: deliveryCount('SENT'),
  failedCount: deliveryCount('FAILED')
}

export const newsletterIssueQueries = {
  newsletterIssues: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
    requirePermission(context, 'newsletter:manage')

    const locale = sql<string>`coalesce(${newsletterSubscribers.locale}, ${NEWSLETTER_FALLBACK_LOCALE})`

    // ponytail: newest 50 issues without pagination; a weekly cadence takes a year to reach it.
    const [items, audience] = await Promise.all([
      context.db
        .select(issueColumns)
        .from(newsletterIssues)
        .orderBy(desc(newsletterIssues.createdAt))
        .limit(ISSUES_LIMIT),
      context.db
        .select({ locale, subscribed: sql<number>`count(*)`.mapWith(Number) })
        .from(newsletterSubscribers)
        .where(eq(newsletterSubscribers.status, 'subscribed'))
        .groupBy(locale)
    ])

    return { items, audience }
  },

  newsletterIssue: async (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
    requirePermission(context, 'newsletter:manage')

    const [issue] = await context.db
      .select(issueColumns)
      .from(newsletterIssues)
      .where(eq(newsletterIssues.id, args.id))
      .limit(1)

    return issue ?? null
  }
}
