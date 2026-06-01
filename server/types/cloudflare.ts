import type { D1Database } from '@cloudflare/workers-types'

export type CloudflareEnv = {
  DB: D1Database
  JWT_SECRET?: string
  AUTH_TOKEN_TTL_SECONDS?: string
  ALLOW_PUBLIC_REGISTER?: string
}
