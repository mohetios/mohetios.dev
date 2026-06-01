import { createError, type H3Event } from 'h3'
import type { D1Database } from '@cloudflare/workers-types'

type CloudflareRuntime = {
  cloudflare?: {
    env?: Partial<CloudflareEnv>
  }
}

type RuntimeCarrier = {
  runtime?: CloudflareRuntime
}

export type CloudflareEnv = {
  DB: D1Database
  JWT_SECRET?: string
  AUTH_TOKEN_TTL_SECONDS?: string
  ALLOW_PUBLIC_REGISTER?: string
}

export function getCloudflareEnv(event: H3Event): CloudflareEnv {
  const legacyRequest = event as H3Event & { req?: RuntimeCarrier }
  const runtimeEnv =
    event.context.cloudflare?.env ||
    (event.node?.req as RuntimeCarrier | undefined)?.runtime?.cloudflare?.env ||
    legacyRequest.req?.runtime?.cloudflare?.env

  if (!runtimeEnv?.DB) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Cloudflare DB binding is not available'
    })
  }

  return runtimeEnv as CloudflareEnv
}
