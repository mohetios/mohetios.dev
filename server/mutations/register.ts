import { count, eq } from 'drizzle-orm'
import { GraphQLError } from 'graphql'

import { users } from '../models/schema'
import type { GraphQLContext } from '../routes/graph'
import {
  normalizeUserRole,
  normalizeUsername,
  validatePassword,
  validateUsername
} from '../utils/auth'
import { generateSalt, getPasswordIterations, hashPassword, signAuthToken } from '../utils/crypto'
import { createId } from '../utils/id'
import { requireTurnstileToken } from '../utils/turnstile'

type RegisterArgs = {
  input: {
    username: string
    password: string
    displayName?: string | null
    turnstileToken: string
  }
}

export async function register(_parent: unknown, args: RegisterArgs, context: GraphQLContext) {
  await requireTurnstileToken(args.input.turnstileToken, context)

  const [userCount] = await context.db.select({ value: count() }).from(users)

  if ((userCount?.value ?? 0) !== 0) {
    throw new GraphQLError('Registration is closed')
  }

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

  const now = new Date().toISOString()
  const id = createId()
  const role = 'OWNER' as const
  const salt = generateSalt()
  const iterations = getPasswordIterations()
  const passwordHash = await hashPassword(password, salt, iterations)
  const displayName = args.input.displayName?.trim() || null

  await context.db.insert(users).values({
    id,
    username,
    role,
    displayName,
    passwordHash,
    passwordSalt: salt,
    passwordIterations: iterations,
    createdAt: now,
    updatedAt: now
  })

  const user = {
    id,
    username,
    role,
    displayName,
    bio: null,
    website: null,
    avatarUrl: null,
    createdAt: now
  }

  return {
    token: await signAuthToken(user, context.env),
    user: {
      id: user.id,
      username: user.username,
      role: normalizeUserRole(user.role),
      displayName: user.displayName,
      bio: user.bio,
      website: user.website,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt
    }
  }
}
