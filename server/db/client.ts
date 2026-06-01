import { drizzle } from 'drizzle-orm/d1'
import { createError, type H3Event } from 'h3'

import * as schema from './schema'
import type { CloudflareEnv } from '../types/cloudflare'

type CloudflareRuntime = {
  cloudflare?: {
    env?: CloudflareEnv
  }
}

export function getCloudflareEnv(event: H3Event): CloudflareEnv {
  const runtimeEnv =
    event.context.cloudflare?.env ||
    (event.req as unknown as { runtime?: CloudflareRuntime }).runtime?.cloudflare?.env

  if (!runtimeEnv?.DB) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Cloudflare DB binding is not available'
    })
  }

  return runtimeEnv as CloudflareEnv
}

export function getDb(event: H3Event) {
  const env = getCloudflareEnv(event)

  return drizzle(env.DB, { schema })
}

export type Db = ReturnType<typeof getDb>
