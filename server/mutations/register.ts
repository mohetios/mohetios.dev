import { count, eq } from 'drizzle-orm'
import { GraphQLError } from 'graphql'

import type { UserRole } from '../../shared/constants/permissions'
import { users } from '../models/schema'
import type { GraphQLContext } from '../routes/graph'
import {
  normalizeUserRole,
  normalizeUsername,
  validatePassword,
  validateUsername
} from '../utils/auth'
import { generateSalt, hashPassword, signAuthToken } from '../utils/crypto'
import { createId } from '../utils/id'

type RegisterArgs = {
  input: {
    username: string
    password: string
    displayName?: string | null
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

  const [userCount] = await context.db.select({ value: count() }).from(users)
  const firstUser = (userCount?.value ?? 0) === 0

  // if (!firstUser && context.env.ALLOW_PUBLIC_REGISTER !== 'true') {
  //   throw new GraphQLError('Registration is closed')
  // }

  const now = new Date().toISOString()
  const id = createId()
  const role: Exclude<UserRole, 'GUEST'> = firstUser ? 'OWNER' : 'MEMBER'
  const salt = generateSalt()
  const iterations = 210000
  const passwordHash = await hashPassword(password, salt, iterations)
  await context.db
    .insert(users)
    .values({
      id,
      username,
      role,
      passwordHash,
      passwordSalt: salt,
      passwordIterations: iterations,
      createdAt: now,
      updatedAt: now
    })

  const displayName = args.input.displayName?.trim() || null

  if (displayName) {
    await context.db
      .update(users)
      .set({ displayName, updatedAt: now })
      .where(eq(users.id, id))
      .catch(() => undefined)
  }

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
