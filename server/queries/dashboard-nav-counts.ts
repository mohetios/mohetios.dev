import { and, eq, isNull, sql } from 'drizzle-orm'

import { comments, inboxMessages } from '../models/schema'
import type { GraphQLContext } from '../routes/graph'
import { requirePermission } from '../utils/auth'

export async function dashboardNavCounts(
  _parent: unknown,
  _args: Record<string, never>,
  context: GraphQLContext
) {
  requirePermission(context, 'dashboard:view')

  const [inboxRows, commentRows] = await Promise.all([
    context.db
      .select({ count: sql<number>`count(*)` })
      .from(inboxMessages)
      .where(and(isNull(inboxMessages.trashedAt), eq(inboxMessages.status, 'NEW'))),

    context.db
      .select({ count: sql<number>`count(*)` })
      .from(comments)
      .where(eq(comments.status, 'PENDING'))
  ])

  return {
    inboxUnread: Number(inboxRows[0]?.count || 0),
    pendingComments: Number(commentRows[0]?.count || 0)
  }
}
