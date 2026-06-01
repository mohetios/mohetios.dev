import { eq } from 'drizzle-orm'
import { GraphQLError } from 'graphql'

import { users } from '../models/schema'
import type { GraphQLContext } from '../routes/graph'
import { normalizeUsername, validatePassword, validateUsername } from '../utils/auth'
import { signAuthToken, verifyPassword } from '../utils/crypto'

type LoginArgs = {
  input: {
    username: string
    password: string
  }
}

const invalidLoginMessage = 'Invalid username or password'

export async function login(_parent: unknown, args: LoginArgs, context: GraphQLContext) {
  const username = normalizeUsername(args.input.username)

  validateUsername(username)
  validatePassword(args.input.password)

  const [user] = await context.db.select().from(users).where(eq(users.username, username)).limit(1)

  if (!user) {
    throw new GraphQLError(invalidLoginMessage)
  }

  const validPassword = await verifyPassword(
    args.input.password,
    user.passwordHash,
    user.passwordSalt,
    user.passwordIterations
  )

  if (!validPassword) {
    throw new GraphQLError(invalidLoginMessage)
  }

  return {
    token: await signAuthToken(user, context.env),
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt
    }
  }
}
