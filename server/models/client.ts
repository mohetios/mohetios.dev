import { drizzle } from 'drizzle-orm/d1'
import * as schema from './schema'
import { getServerEnv } from '../utils/env'

export function getDb(event: any) {
  const env = getServerEnv(event)

  return drizzle(env.DB, { schema })
}