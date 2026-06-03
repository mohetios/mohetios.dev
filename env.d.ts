/// <reference types="@cloudflare/workers-types" />

import type { Permission } from './shared/constants/permissions'

declare global {
  interface CloudflareEnv {
    DB: D1Database
    ADMIN_NOTIFICATION_QUEUE?: Queue
    EMAIL?: {
      send(message: unknown): Promise<unknown>
    }
    NUXT_JWT_SECRET?: string
    NUXT_AUTH_TOKEN_TTL_SECONDS?: string
    NUXT_ALLOW_PUBLIC_REGISTER?: string
    NUXT_MAIL_FROM?: string
    NUXT_MAIL_FROM_NAME?: string
    NUXT_VAPID_PUBLIC_KEY?: string
    NUXT_VAPID_PRIVATE_KEY?: string
    NUXT_VAPID_SUBJECT?: string
  }
}

declare module 'h3' {
  interface H3EventContext {
    cf: CfProperties
    cloudflare: {
      request: Request
      env: CloudflareEnv
      context: ExecutionContext
    }
  }
}

declare module '#app' {
  interface PageMeta {
    requiredPermission?: Permission
  }
}

export {}
