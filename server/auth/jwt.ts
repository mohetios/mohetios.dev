import { jwtVerify, SignJWT } from 'jose'
import { createError } from 'h3'

import type { User } from '../db/schema'
import type { CloudflareEnv } from '../types/cloudflare'

const defaultTtlSeconds = 60 * 60 * 24 * 7

function getJwtSecret(env: CloudflareEnv) {
  const secret = env.JWT_SECRET

  if (!secret && process.env.NODE_ENV === 'production') {
    throw createError({
      statusCode: 500,
      statusMessage: 'JWT secret is not configured'
    })
  }

  return new TextEncoder().encode(secret || 'local-development-jwt-secret')
}

export async function signAuthToken(user: Pick<User, 'id' | 'email' | 'role'>, env: CloudflareEnv) {
  const ttlSeconds = Number(env.AUTH_TOKEN_TTL_SECONDS || defaultTtlSeconds)

  return new SignJWT({ email: user.email, role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${Number.isFinite(ttlSeconds) ? ttlSeconds : defaultTtlSeconds}s`)
    .sign(getJwtSecret(env))
}

export async function verifyAuthToken(token: string, env: CloudflareEnv) {
  const { payload } = await jwtVerify(token, getJwtSecret(env), {
    algorithms: ['HS256']
  })

  if (!payload.sub || typeof payload.email !== 'string' || typeof payload.role !== 'string') {
    return null
  }

  return {
    id: payload.sub,
    email: payload.email,
    role: payload.role
  }
}
