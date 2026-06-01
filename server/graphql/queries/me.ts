import { findUserById } from '../../db/users.repository'
import type { GraphqlContext } from '../types'
import { toSafeUser } from '../types'

export async function me(_parent: unknown, _args: unknown, context: GraphqlContext) {
  if (!context.user) {
    return null
  }

  const user = await findUserById(context.db, context.user.id)

  return user ? toSafeUser(user) : null
}
