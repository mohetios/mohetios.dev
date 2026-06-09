import { createError, getHeader, getRequestURL, type H3Event } from 'h3'
import { GraphQLError } from 'graphql'

import type { RateLimitRule } from '../../shared/constants/security'
import { getBearerToken } from './auth'

export function getRateLimitWindowStart(now: number, rule: RateLimitRule) {
  return now - rule.windowMs
}

export function isRateLimitExceeded(count: number, rule: RateLimitRule) {
  return count >= rule.max
}

export function throwRateLimitGraphQLError(message: string, code: string): never {
  throw new GraphQLError(message, {
    extensions: {
      code,
      http: { status: 429 }
    }
  })
}

function normalizeOrigin(value: string): string | null {
  try {
    return new URL(value).origin
  } catch {
    return null
  }
}

function getAllowedOrigins(event: H3Event): Set<string> {
  const origins = new Set<string>([getRequestURL(event).origin])

  if (process.env.NODE_ENV === 'production') {
    origins.add('https://mohetios.dev')
    origins.add('https://www.mohetios.dev')
  } else {
    origins.add('http://localhost:3000')
    origins.add('http://127.0.0.1:3000')
  }

  return origins
}

function isAllowedOrigin(value: string, allowedOrigins: Set<string>) {
  const origin = normalizeOrigin(value)

  return origin ? allowedOrigins.has(origin) : false
}

function isBrowserCrossOriginRequest(event: H3Event) {
  const allowedOrigins = getAllowedOrigins(event)
  const origin = getHeader(event, 'origin')

  if (origin) {
    return !isAllowedOrigin(origin, allowedOrigins)
  }

  const referer = getHeader(event, 'referer')

  if (referer) {
    return !isAllowedOrigin(referer, allowedOrigins)
  }

  return false
}

export function assertSameOriginIfAuthenticated(event: H3Event) {
  if (!getBearerToken(event)) {
    return
  }

  if (isBrowserCrossOriginRequest(event)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden'
    })
  }
}
