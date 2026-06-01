import { eq } from 'drizzle-orm'

import { users } from '../models/schema'
import type { GraphQLContext } from '../routes/graph'
import { normalizeUserRole } from '../utils/auth'

export const me = async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
  if (!context.userId) return null

  const [user] = await context.db
    .select({
      id: users.id,
      username: users.username,
      role: users.role,
      createdAt: users.createdAt
    })
    .from(users)
    .where(eq(users.id, context.userId))
    .limit(1)

  if (!user) return null

  return {
    id: user.id,
    username: user.username,
    role: normalizeUserRole(user.role),
    displayName: null,
    bio: null,
    website: null,
    avatarUrl: null,
    createdAt: user.createdAt
  }
}
