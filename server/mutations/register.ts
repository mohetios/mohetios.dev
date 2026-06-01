import { eq } from 'drizzle-orm'
import { GraphQLError } from 'graphql'

import { users } from '../models/schema'
import type { GraphQLContext } from '../routes/graph'
import { normalizeUsername, validatePassword, validateUsername } from '../utils/auth'
import { generateSalt, hashPassword, signAuthToken } from '../utils/crypto'
import { createId } from '../utils/id'

type RegisterArgs = {
  input: {
    username: string
    password: string
  }
}

export async function register(_parent: unknown, args: RegisterArgs, context: GraphQLContext) {
  const username = normalizeUsername(args.input.username)
  const password = args.input.password

  validateUsername(username)
  validatePassword(password)

  const [existing] = await context.db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, username))
    .limit(1)

  if (existing) {
    throw new GraphQLError('Registration is closed')
  }

  const [firstExistingUser] = await context.db.select({ id: users.id }).from(users).limit(1)
  const firstUser = !firstExistingUser

  if (!firstUser && context.env.ALLOW_PUBLIC_REGISTER !== 'true') {
    throw new GraphQLError('Registration is closed')
  }

  const now = new Date().toISOString()
  const salt = generateSalt()
  const iterations = 210000
  const passwordHash = await hashPassword(password, salt, iterations)
  const [user] = await context.db
    .insert(users)
    .values({
      id: createId(),
      username,
      role: firstUser ? 'ADMIN' : 'USER',
      passwordHash,
      passwordSalt: salt,
      passwordIterations: iterations,
      createdAt: now,
      updatedAt: now
    })
    .returning()

  if (!user) {
    throw new GraphQLError('Could not create user')
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
