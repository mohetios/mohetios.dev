import { GraphQLError } from 'graphql'

import { signAuthToken } from '../../auth/jwt'
import { normalizeEmail, verifyPassword } from '../../auth/password'
import { findUserByEmail } from '../../db/users.repository'
import type { GraphqlContext, LoginInput } from '../types'
import { toSafeUser } from '../types'

const invalidLoginMessage = 'Invalid email or password'

export async function authLogin(
  _parent: unknown,
  args: { input: LoginInput },
  context: GraphqlContext
) {
  const user = await findUserByEmail(context.db, normalizeEmail(args.input.email))

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
    user: toSafeUser(user)
  }
}
