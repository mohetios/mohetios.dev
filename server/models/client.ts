import { drizzle } from 'drizzle-orm/d1'
import type { H3Event } from 'h3'

import * as schema from './schema'
import { getServerEnv } from '../utils/env'

export function getDb(event: H3Event) {
  const env = getServerEnv(event)

  return drizzle(env.DB, { schema })
}

export type AppDb = ReturnType<typeof getDb>
