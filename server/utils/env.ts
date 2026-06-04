import type { D1Database, Queue } from '@cloudflare/workers-types'
import type { H3Event } from 'h3'

import type { EmailDeliveryJob } from '../../shared/contracts/email'
import type { AdminNotificationJob } from '../../shared/contracts/notifications'

export type ServerEnv = {
  DB: D1Database
  ADMIN_NOTIFICATION_QUEUE?: Queue<AdminNotificationJob>
  EMAIL_DELIVERY_QUEUE?: Queue<EmailDeliveryJob>

  NUXT_JWT_SECRET: string
  NUXT_AUTH_TOKEN_TTL_SECONDS: string
  NUXT_ALLOW_PUBLIC_REGISTER: string

  NUXT_MAIL_FROM: string
  NUXT_MAIL_FROM_NAME: string

  NUXT_VAPID_PUBLIC_KEY: string
  NUXT_VAPID_PRIVATE_KEY: string
  NUXT_VAPID_SUBJECT: string
}

type CloudflareRuntimeEnv = {
  DB?: D1Database
  ADMIN_NOTIFICATION_QUEUE?: Queue<AdminNotificationJob>
  EMAIL_DELIVERY_QUEUE?: Queue<EmailDeliveryJob>

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

function readString(...values: unknown[]) {
  for (const value of values) {
    const normalized = String(value || '').trim()

    if (normalized) return normalized
  }

  return ''
}

export function getServerEnv(event: H3Event): ServerEnv {
  const runtimeConfig = useRuntimeConfig(event)
  const cloudflareEvent = event as CloudflareEvent

  const cloudflareEnv =
    cloudflareEvent.req?.runtime?.cloudflare?.env || cloudflareEvent.context.cloudflare?.env || {}

  const DB = cloudflareEnv.DB as D1Database | undefined

  if (!DB) {
    throw new Error('D1 binding DB is not configured')
  }

  const NUXT_JWT_SECRET = readString(runtimeConfig.jwtSecret, cloudflareEnv.NUXT_JWT_SECRET)

  if (!NUXT_JWT_SECRET) {
    throw new Error('JWT secret is not configured')
  }

  return {
    DB,

    ADMIN_NOTIFICATION_QUEUE: cloudflareEnv.ADMIN_NOTIFICATION_QUEUE as
      | Queue<AdminNotificationJob>
      | undefined,

    EMAIL_DELIVERY_QUEUE: cloudflareEnv.EMAIL_DELIVERY_QUEUE as Queue<EmailDeliveryJob> | undefined,

    NUXT_JWT_SECRET,

    NUXT_AUTH_TOKEN_TTL_SECONDS:
      readString(runtimeConfig.authTokenTtlSeconds, cloudflareEnv.NUXT_AUTH_TOKEN_TTL_SECONDS) ||
      '604800',

    NUXT_ALLOW_PUBLIC_REGISTER:
      readString(runtimeConfig.allowPublicRegister, cloudflareEnv.NUXT_ALLOW_PUBLIC_REGISTER) ||
      'false',

    NUXT_MAIL_FROM:
      readString(runtimeConfig.mailFrom, cloudflareEnv.NUXT_MAIL_FROM) || 'hi@mohetios.dev',

    NUXT_MAIL_FROM_NAME:
      readString(runtimeConfig.mailFromName, cloudflareEnv.NUXT_MAIL_FROM_NAME) || 'Mohetios.dev',

    NUXT_VAPID_PUBLIC_KEY: readString(
      runtimeConfig.vapidPublicKey,
      cloudflareEnv.NUXT_VAPID_PUBLIC_KEY
    ),

    NUXT_VAPID_PRIVATE_KEY: readString(
      runtimeConfig.vapidPrivateKey,
      cloudflareEnv.NUXT_VAPID_PRIVATE_KEY
    ),

    NUXT_VAPID_SUBJECT:
      readString(runtimeConfig.vapidSubject, cloudflareEnv.NUXT_VAPID_SUBJECT) ||
      'mailto:hi@mohetios.dev'
  }
}

export type CloudflareEnv = ServerEnv
