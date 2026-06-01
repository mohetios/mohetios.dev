import type { H3Event } from 'h3'

import type { Db } from '../db/client'
import type { User } from '../db/schema'
import type { CloudflareEnv } from '../types/cloudflare'

export type SafeUser = {
  id: string
  email: string
  name: string | null
  role: User['role']
  createdAt: string
  updatedAt: string
}

export type GraphqlContext = {
  event: H3Event
  db: Db
  env: CloudflareEnv
  user: SafeUser | null
}

export type RegisterInput = {
  email: string
  password: string
  name?: string | null
}

export type LoginInput = {
  email: string
  password: string
}

export function toSafeUser(user: User): SafeUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  }
}
