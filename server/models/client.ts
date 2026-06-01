import { drizzle } from 'drizzle-orm/d1'
import type { H3Event } from 'h3'

import * as schema from './schema'
import { getCloudflareEnv } from '../utils/env'

export function getDb(event: H3Event) {
  const env = getCloudflareEnv(event)

  return drizzle(env.DB, { schema })
}

export type Db = ReturnType<typeof getDb>
