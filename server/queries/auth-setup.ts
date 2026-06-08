import { count } from 'drizzle-orm'

import { users } from '../models/schema'
import type { GraphQLContext } from '../routes/graph'

export async function authSetupAvailable(
  _parent: unknown,
  _args: unknown,
  context: GraphQLContext
) {
  const [userCount] = await context.db.select({ value: count() }).from(users)

  return (userCount?.value ?? 0) === 0
}
