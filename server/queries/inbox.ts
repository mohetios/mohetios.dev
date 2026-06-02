import { desc } from 'drizzle-orm'

import { inboxMessages } from '../models/schema'
import type { GraphQLContext } from '../routes/graph'
import { requirePermission } from '../utils/auth'

export const inboxQueries = {
  inboxMessages: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
    requirePermission(context, 'inbox:manage')

    return context.db.select().from(inboxMessages).orderBy(desc(inboxMessages.createdAt))
  }
}
