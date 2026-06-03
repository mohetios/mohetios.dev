import { createError, type H3Event } from 'h3'

import { canRole } from '../../shared/constants/permissions'
import { getDb } from '../models/client'
import { getBearerToken } from './auth'
import { verifyAuthToken } from './crypto'
import { getServerEnv } from './env'

export async function requireOwnerPushContext(event: H3Event) {
  const env = getServerEnv(event)
  const token = getBearerToken(event)
  const claims = token ? await verifyAuthToken(token, env) : null

  if (!claims?.sub || !canRole(claims.role, 'dashboard:view')) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    })
  }

  return {
    env,
    db: getDb(event),
    userId: claims.sub
  }
}
