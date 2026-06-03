import type { D1Database, Queue } from '@cloudflare/workers-types'
import type { H3Event } from 'h3'

import type { EmailDeliveryJob } from '../../shared/contracts/email'
import type { AdminNotificationJob } from '../../shared/contracts/notifications'

export type ServerEnv = {
  DB: D1Database
  ADMIN_NOTIFICATION_QUEUE?: Queue<AdminNotificationJob>
  EMAIL_DELIVERY_QUEUE?: Queue<EmailDeliveryJob>

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
    cloudflareEvent.req?.runtime?.cloudflare?.env ||
    cloudflareEvent.context.cloudflare?.env ||
    {}

  const DB = cloudflareEnv.DB as D1Database | undefined

  if (!DB) {
    throw new Error('D1 binding DB is not configured')
  }

  const JWT_SECRET = readString(
    runtimeConfig.jwtSecret,
    cloudflareEnv.JWT_SECRET,
    cloudflareEnv.NUXT_JWT_SECRET
  )

  if (!JWT_SECRET) {
    throw new Error('JWT secret is not configured')
  }

  return {
    DB,

    ADMIN_NOTIFICATION_QUEUE: cloudflareEnv.ADMIN_NOTIFICATION_QUEUE as
      | Queue<AdminNotificationJob>
      | undefined,

    EMAIL_DELIVERY_QUEUE: cloudflareEnv.EMAIL_DELIVERY_QUEUE as
      | Queue<EmailDeliveryJob>
      | undefined,

    JWT_SECRET,

    AUTH_TOKEN_TTL_SECONDS:
      readString(
        runtimeConfig.authTokenTtlSeconds,
        cloudflareEnv.AUTH_TOKEN_TTL_SECONDS,
        cloudflareEnv.NUXT_AUTH_TOKEN_TTL_SECONDS
      ) || '604800',

    ALLOW_PUBLIC_REGISTER:
      readString(
        runtimeConfig.allowPublicRegister,
        cloudflareEnv.ALLOW_PUBLIC_REGISTER,
        cloudflareEnv.NUXT_ALLOW_PUBLIC_REGISTER
      ) || 'false',

    MAIL_FROM:
      readString(runtimeConfig.mailFrom, cloudflareEnv.MAIL_FROM, cloudflareEnv.NUXT_MAIL_FROM) ||
      'hi@mohetios.dev',

    MAIL_FROM_NAME:
      readString(
        runtimeConfig.mailFromName,
        cloudflareEnv.MAIL_FROM_NAME,
        cloudflareEnv.NUXT_MAIL_FROM_NAME
      ) || 'Mohetios.dev',

    VAPID_PUBLIC_KEY: readString(
      runtimeConfig.vapidPublicKey,
      cloudflareEnv.VAPID_PUBLIC_KEY,
      cloudflareEnv.NUXT_VAPID_PUBLIC_KEY
    ),

    VAPID_PRIVATE_KEY: readString(
      runtimeConfig.vapidPrivateKey,
      cloudflareEnv.VAPID_PRIVATE_KEY,
      cloudflareEnv.NUXT_VAPID_PRIVATE_KEY
    ),

    VAPID_SUBJECT:
      readString(
        runtimeConfig.vapidSubject,
        cloudflareEnv.VAPID_SUBJECT,
        cloudflareEnv.NUXT_VAPID_SUBJECT
      ) || 'mailto:hi@mohetios.dev'
  }
}

export type CloudflareEnv = ServerEnv