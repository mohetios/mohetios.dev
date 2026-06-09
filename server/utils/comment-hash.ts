import { getHeader, getRequestIP, type H3Event } from 'h3'

import type { GraphQLContext } from '../routes/graph'

async function hashValue(value: string, secret: string, namespace: string) {
  const data = new TextEncoder().encode(`${secret}:comment:${namespace}:${value}`)
  const digest = await crypto.subtle.digest('SHA-256', data)

  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export async function hashCommentEmail(email: string, secret: string) {
  return hashValue(email.toLowerCase(), secret, 'email')
}

export async function hashCommentIp(event: H3Event, secret: string) {
  const ip =
    getRequestIP(event, { xForwardedFor: true }) ||
    getHeader(event, 'cf-connecting-ip') ||
    getHeader(event, 'x-real-ip') ||
    'unknown'

  return hashValue(ip, secret, 'ip')
}

export async function hashCommentUserAgent(event: H3Event, secret: string) {
  const userAgent = getHeader(event, 'user-agent') || 'unknown'

  return hashValue(userAgent, secret, 'user-agent')
}

export async function getCommentRequestHashes(context: GraphQLContext) {
  const secret = context.env.NUXT_JWT_SECRET

  const [ipHash, userAgentHash] = await Promise.all([
    hashCommentIp(context.event, secret),
    hashCommentUserAgent(context.event, secret)
  ])

  return { ipHash, userAgentHash }
}
