/// <reference types="@cloudflare/workers-types" />

interface CloudflareEnv {
  DB: D1Database
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
