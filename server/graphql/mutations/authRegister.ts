import { GraphQLError } from 'graphql'

import { signAuthToken } from '../../auth/jwt'
import { generateSalt, hashPassword, normalizeEmail } from '../../auth/password'
import { createUser, findUserByEmail, hasAnyUser } from '../../db/users.repository'
import type { GraphqlContext, RegisterInput } from '../types'
import { toSafeUser } from '../types'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function authRegister(
  _parent: unknown,
  args: { input: RegisterInput },
  context: GraphqlContext
) {
  const email = normalizeEmail(args.input.email)
  const password = args.input.password

  if (!emailPattern.test(email)) {
    throw new GraphQLError('Enter a valid email address')
  }

  if (password.length < 8) {
    throw new GraphQLError('Password must be at least 8 characters')
  }

  const firstUser = !(await hasAnyUser(context.db))

  if (!firstUser && context.env.ALLOW_PUBLIC_REGISTER !== 'true') {
    throw new GraphQLError('Registration is closed')
  }

  const existing = await findUserByEmail(context.db, email)

  if (existing) {
    throw new GraphQLError('Registration is closed')
  }

  const now = new Date().toISOString()
  const salt = generateSalt()
  const iterations = 210000
  const passwordHash = await hashPassword(password, salt, iterations)
  const user = await createUser(context.db, {
    id: crypto.randomUUID(),
    email,
    name: args.input.name?.trim() || null,
    role: firstUser ? 'ADMIN' : 'USER',
    passwordHash,
    passwordSalt: salt,
    passwordIterations: iterations,
    createdAt: now,
    updatedAt: now
  })

  if (!user) {
    throw new GraphQLError('Could not create user')
  }

  const safeUser = toSafeUser(user)
  const token = await signAuthToken(user, context.env)

  return {
    token,
    user: safeUser
  }
}
