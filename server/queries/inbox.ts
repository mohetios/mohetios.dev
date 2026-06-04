import { desc, isNull } from 'drizzle-orm'

import { adminNotifications, pushSubscriptions } from '../models/schema'
import type { GraphQLContext } from '../routes/graph'
import { requirePermission } from '../utils/auth'
import { createInboxPreview } from '../utils/inbox-map'

export const inboxQueries = {
  adminNotifications: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
    requirePermission(context, 'dashboard:view')

    return context.db
      .select()
      .from(adminNotifications)
      .orderBy(desc(adminNotifications.createdAt))
      .limit(50)
  },

  pushSubscriptions: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
    requirePermission(context, 'dashboard:view')

    return context.db
      .select()
      .from(pushSubscriptions)
      .where(isNull(pushSubscriptions.disabledAt))
      .orderBy(desc(pushSubscriptions.lastUsedAt))
  }
}

export const inboxFieldResolvers = {
  InboxMessage: {
    preview: (message: { bodyText: string; preview?: string | null }) =>
      message.preview || createInboxPreview(message.bodyText)
  }
}
