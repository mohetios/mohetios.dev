import type { H3Event } from 'h3'

import { verifyAuthToken } from '../auth/jwt'
import { getBearerToken } from '../auth/token'
import { getCloudflareEnv, getDb } from '../db/client'
import { findUserById } from '../db/users.repository'
import { toSafeUser, type GraphqlContext } from './types'

export async function createGraphqlContext(event: H3Event): Promise<GraphqlContext> {
  const db = getDb(event)
  const env = getCloudflareEnv(event)
  const token = getBearerToken(event)
  let user = null

  if (token) {
    try {
      const claims = await verifyAuthToken(token, env)
      const dbUser = claims?.id ? await findUserById(db, claims.id) : null

      user = dbUser ? toSafeUser(dbUser) : null
    } catch {
      user = null
    }
  }

  return {
    event,
    db,
    env,
    user
  }
}
