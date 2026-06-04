import { and, desc, eq, isNull } from 'drizzle-orm'

import {
  adminNotifications,
  inboxMessages,
  inboxReplies,
  pushSubscriptions
} from '../models/schema'
import type { GraphQLContext } from '../routes/graph'
import { requirePermission } from '../utils/auth'
import type {
  InboxMessageKind,
  InboxMessageSource,
  InboxMessageStatus
} from '../../shared/contracts/inbox'

export const inboxQueries = {
  inboxMessages: async (
    _parent: unknown,
    args: {
      filter?: {
        status?: string | null
        kind?: string | null
        source?: string | null
      } | null
      pagination?: {
        limit?: number | null
        offset?: number | null
      } | null
    },
    context: GraphQLContext
  ) => {
    requirePermission(context, 'inbox:manage')

    const filters = [
      args.filter?.status
        ? eq(inboxMessages.status, args.filter.status as InboxMessageStatus)
        : undefined,
      args.filter?.kind ? eq(inboxMessages.kind, args.filter.kind as InboxMessageKind) : undefined,
      args.filter?.source
        ? eq(inboxMessages.source, args.filter.source as InboxMessageSource)
        : undefined
    ].filter(Boolean)
    const limit = Math.min(Math.max(args.pagination?.limit || 50, 1), 100)
    const offset = Math.max(args.pagination?.offset || 0, 0)

    const query = context.db.select().from(inboxMessages)

    if (filters.length) {
      return query
        .where(and(...filters))
        .orderBy(desc(inboxMessages.lastActivityAt))
        .limit(limit)
        .offset(offset)
    }

    return query.orderBy(desc(inboxMessages.lastActivityAt)).limit(limit).offset(offset)
  },

  inboxMessage: async (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
    requirePermission(context, 'inbox:manage')

    const [message] = await context.db
      .select()
      .from(inboxMessages)
      .where(eq(inboxMessages.id, args.id))
      .limit(1)

    return message || null
  },

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
    preview: (message: { bodyText: string }) => {
      return message.bodyText.length > 160
        ? `${message.bodyText.slice(0, 157).trimEnd()}...`
        : message.bodyText
    },
    replies: async (message: { id: string }, _args: unknown, context: GraphQLContext) => {
      requirePermission(context, 'inbox:manage')

      return context.db
        .select()
        .from(inboxReplies)
        .where(eq(inboxReplies.inboxMessageId, message.id))
        .orderBy(desc(inboxReplies.createdAt))
    }
  }
}
