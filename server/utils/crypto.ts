import { createError } from 'h3'

import type { UserRole } from '../../shared/constants/permissions'
import type { User } from '../models/schema'
import { normalizeUserRole } from './auth'
import type { CloudflareEnv } from './env'

const defaultIterations = 210000
const defaultTtlSeconds = 60 * 60 * 24 * 7

export type AuthClaims = {
  sub: string
  username: string
  role: Exclude<UserRole, 'GUEST'>
  iat: number
  exp: number
}

function bytesToBase64Url(bytes: Uint8Array) {
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('')

  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')
}

function base64UrlToBytes(value: string) {
  const base64 = value.replaceAll('-', '+').replaceAll('_', '/').padEnd(
    Math.ceil(value.length / 4) * 4,
    '='
  )
  const binary = atob(base64)

  return Uint8Array.from(binary, (char) => char.charCodeAt(0))
}

function textToBase64Url(value: string) {
  return bytesToBase64Url(new TextEncoder().encode(value))
}

function base64UrlToText(value: string) {
  return new TextDecoder().decode(base64UrlToBytes(value))
}

function timingSafeEqual(left: string, right: string) {
  const leftBytes = base64UrlToBytes(left)
  const rightBytes = base64UrlToBytes(right)

  if (leftBytes.length !== rightBytes.length) {
    return false
  }

  let diff = 0

  for (let index = 0; index < leftBytes.length; index += 1) {
    diff |= leftBytes[index]! ^ rightBytes[index]!
  }

  return diff === 0
}

function getJwtSecret(env: CloudflareEnv) {
  const secret = env.JWT_SECRET

  if (!secret && process.env.NODE_ENV === 'production') {
    throw createError({
      statusCode: 500,
      statusMessage: 'JWT secret is not configured'
    })
  }

  return secret || 'local-development-jwt-secret'
}

async function getHmacKey(secret: string) {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

async function signHmac(value: string, secret: string) {
  const key = await getHmacKey(secret)
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value))

  return bytesToBase64Url(new Uint8Array(signature))
}

export function generateSalt() {
  const salt = new Uint8Array(16)
  crypto.getRandomValues(salt)

  return bytesToBase64Url(salt)
}

export async function hashPassword(
  password: string,
  salt: string,
  iterations = defaultIterations
) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  )
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: base64UrlToBytes(salt),
      iterations
    },
    key,
    256
  )

  return bytesToBase64Url(new Uint8Array(bits))
}

export async function verifyPassword(
  password: string,
  storedHash: string,
  salt: string,
  iterations = defaultIterations
) {
  const hash = await hashPassword(password, salt, iterations)

  return timingSafeEqual(hash, storedHash)
}

export async function signAuthToken(
  user: Pick<User, 'id' | 'username' | 'role'>,
  env: CloudflareEnv
) {
  const now = Math.floor(Date.now() / 1000)
  const ttlSeconds = Number(env.AUTH_TOKEN_TTL_SECONDS || defaultTtlSeconds)
  const expiresIn = Number.isFinite(ttlSeconds) ? ttlSeconds : defaultTtlSeconds
  const header = textToBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = textToBase64Url(
    JSON.stringify({
      sub: user.id,
      username: user.username,
      role: normalizeUserRole(user.role),
      iat: now,
      exp: now + expiresIn
    } satisfies AuthClaims)
  )
  const body = `${header}.${payload}`
  const signature = await signHmac(body, getJwtSecret(env))

  return `${body}.${signature}`
}

export async function verifyAuthToken(token: string, env: CloudflareEnv) {
  const [header, payload, signature] = token.split('.')

  if (!header || !payload || !signature) {
    return null
  }

  const body = `${header}.${payload}`
  const expectedSignature = await signHmac(body, getJwtSecret(env))

  if (!timingSafeEqual(signature, expectedSignature)) {
    return null
  }

  const claims = JSON.parse(base64UrlToText(payload)) as Partial<AuthClaims>

  if (
    !claims.sub ||
    typeof claims.username !== 'string' ||
    (claims.role !== 'OWNER' && claims.role !== 'MEMBER') ||
    typeof claims.exp !== 'number' ||
    claims.exp <= Math.floor(Date.now() / 1000)
  ) {
    return null
  }

  return {
    sub: claims.sub,
    username: claims.username,
    role: claims.role
  }
}
