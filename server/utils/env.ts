import type { D1Database, Queue } from '@cloudflare/workers-types'
import type { H3Event } from 'h3'

export type ServerEnv = {
  DB: D1Database
  ADMIN_NOTIFICATION_QUEUE?: Queue
  EMAIL?: {
    send(message: unknown): Promise<unknown>
  }
  JWT_SECRET: string
  AUTH_TOKEN_TTL_SECONDS: string
  ALLOW_PUBLIC_REGISTER: string
  MAIL_FROM: string
  MAIL_FROM_NAME: string
  VAPID_PUBLIC_KEY: string
  VAPID_PRIVATE_KEY: string
  VAPID_SUBJECT: string
}

type CloudflareRuntimeEnv = Partial<ServerEnv> & {
  NUXT_JWT_SECRET?: string
  NUXT_AUTH_TOKEN_TTL_SECONDS?: string
  NUXT_ALLOW_PUBLIC_REGISTER?: string
  NUXT_MAIL_FROM?: string
  NUXT_MAIL_FROM_NAME?: string
  NUXT_VAPID_PUBLIC_KEY?: string
  NUXT_VAPID_PRIVATE_KEY?: string
  NUXT_VAPID_SUBJECT?: string
}

type CloudflareEvent = H3Event & {
  req?: {
    runtime?: {
      cloudflare?: {
        env?: CloudflareRuntimeEnv
      }
    }
  }
  context: H3Event['context'] & {
    cloudflare?: {
      env?: CloudflareRuntimeEnv
    }
  }
}

export function getServerEnv(event: H3Event): ServerEnv {
  const runtimeConfig = useRuntimeConfig(event)
  const cloudflareEvent = event as CloudflareEvent

  const cloudflareEnv =
    cloudflareEvent.req?.runtime?.cloudflare?.env || cloudflareEvent.context.cloudflare?.env || {}

  const DB = cloudflareEnv.DB as D1Database | undefined
  const ADMIN_NOTIFICATION_QUEUE = cloudflareEnv.ADMIN_NOTIFICATION_QUEUE as Queue | undefined
  const EMAIL = cloudflareEnv.EMAIL as ServerEnv['EMAIL'] | undefined

  if (!DB) {
    throw new Error('D1 binding DB is not configured')
  }

  const JWT_SECRET =
    String(runtimeConfig.jwtSecret || '') || String(cloudflareEnv.NUXT_JWT_SECRET || '')

  if (!JWT_SECRET) {
    throw new Error('JWT secret is not configured')
  }

  return {
    DB,
    ADMIN_NOTIFICATION_QUEUE,
    EMAIL,
    JWT_SECRET,
    AUTH_TOKEN_TTL_SECONDS:
      String(runtimeConfig.authTokenTtlSeconds || '') ||
      String(cloudflareEnv.NUXT_AUTH_TOKEN_TTL_SECONDS || '604800'),
    ALLOW_PUBLIC_REGISTER:
      String(runtimeConfig.allowPublicRegister || '') ||
      String(cloudflareEnv.NUXT_ALLOW_PUBLIC_REGISTER || 'false'),
    MAIL_FROM:
      String(runtimeConfig.mailFrom || '') || String(cloudflareEnv.NUXT_MAIL_FROM || 'hi@mohetios.dev'),
    MAIL_FROM_NAME:
      String(runtimeConfig.mailFromName || '') ||
      String(cloudflareEnv.NUXT_MAIL_FROM_NAME || 'Mohetios.dev'),
    VAPID_PUBLIC_KEY:
      String(runtimeConfig.vapidPublicKey || '') ||
      String(cloudflareEnv.NUXT_VAPID_PUBLIC_KEY || ''),
    VAPID_PRIVATE_KEY:
      String(runtimeConfig.vapidPrivateKey || '') ||
      String(cloudflareEnv.NUXT_VAPID_PRIVATE_KEY || ''),
    VAPID_SUBJECT:
      String(runtimeConfig.vapidSubject || '') ||
      String(cloudflareEnv.NUXT_VAPID_SUBJECT || 'mailto:hi@mohetios.dev')
  }
}

export type CloudflareEnv = ServerEnv
