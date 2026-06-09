export type RateLimitRule = {
  windowMs: number
  max: number
}

/** Matches nuxt-security `requestSizeLimiter.maxRequestSizeInBytes`. */
export const REQUEST_SIZE_LIMIT_BYTES = 200_000

/** CSP origins for Cloudflare-injected scripts (Turnstile, Web Analytics beacon). */
export const CLOUDFLARE_CSP_ORIGINS = {
  turnstile: 'https://challenges.cloudflare.com',
  webAnalyticsScript: 'https://static.cloudflareinsights.com',
  webAnalyticsConnect: 'https://cloudflareinsights.com'
} as const

/**
 * Coarse per-IP limit for `/graph` and `/api/**` via nuxt-security.
 * Site-wide rateLimiter stays off so static/prerendered pages are unaffected.
 */
export const API_GRAPH_RATE_LIMITER = {
  tokensPerInterval: 150,
  interval: 300_000,
  headers: true,
  throwError: true
} as const

/**
 * Fine-grained mutation limits enforced in GraphQL resolvers (D1-backed).
 */
export const PUBLIC_MUTATION_RATE_LIMITS = {
  createComment: {
    commentsPerIp: { windowMs: 5 * 60 * 1000, max: 2 },
    repliesPerIp: { windowMs: 5 * 60 * 1000, max: 1 },
    commentsPerEmail: { windowMs: 12 * 60 * 60 * 1000, max: 3 }
  }
} as const satisfies Record<string, Record<string, RateLimitRule>>
