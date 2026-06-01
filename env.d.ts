/// <reference types="@cloudflare/workers-types" />

declare global {
  interface CloudflareEnv {
    DB: D1Database
    JWT_SECRET?: string
    AUTH_TOKEN_TTL_SECONDS?: string
    ALLOW_PUBLIC_REGISTER?: string
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

export {}
