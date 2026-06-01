import type { D1Database } from '@cloudflare/workers-types'

export type ServerEnv = {
  DB: D1Database
  JWT_SECRET: string
  AUTH_TOKEN_TTL_SECONDS: string
  ALLOW_PUBLIC_REGISTER: string
}

export function getServerEnv(event: any): ServerEnv {
  const runtimeConfig = useRuntimeConfig(event)

  const cloudflareEnv =
    event?.req?.runtime?.cloudflare?.env || event?.context?.cloudflare?.env || {}

  const DB = cloudflareEnv.DB as D1Database | undefined

  if (!DB) {
    throw new Error('D1 binding DB is not configured')
  }

  const JWT_SECRET = String(runtimeConfig.jwtSecret || '') || String(cloudflareEnv.JWT_SECRET || '')

  if (!JWT_SECRET) {
    throw new Error('JWT secret is not configured')
  }

  return {
    DB,
    JWT_SECRET,
    AUTH_TOKEN_TTL_SECONDS:
      String(runtimeConfig.authTokenTtlSeconds || '') ||
      String(cloudflareEnv.AUTH_TOKEN_TTL_SECONDS || '604800'),
    ALLOW_PUBLIC_REGISTER:
      String(runtimeConfig.allowPublicRegister || '') ||
      String(cloudflareEnv.ALLOW_PUBLIC_REGISTER || 'false')
  }
}

export type CloudflareEnv = ServerEnv
