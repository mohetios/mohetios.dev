import { eq } from 'drizzle-orm'

import { users } from '../models/schema'
import type { GraphQLContext } from '../routes/graph'

export const me = async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
  if (!context.userId) return null

  const [user] = await context.db
    .select()
    .from(users)
    .where(eq(users.id, context.userId))
    .limit(1)

  if (!user) return null

  return {
    id: user.id,
    username: user.username,
    role: user.role,
    createdAt: user.createdAt
  }
}
