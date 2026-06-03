import { createError } from 'h3'

import type { UserRole } from '../../shared/constants/permissions'
import type { User } from '../models/schema'
import { normalizeUserRole } from './auth'
import type { CloudflareEnv } from './env'

const maxPbkdf2Iterations = 100_000
const defaultIterations = 100_000
const defaultTtlSeconds = 60 * 60 * 24 * 7

export type AuthClaims = {
  sub: string
  username: string
  role: Exclude<UserRole, 'GUEST'>
  iat: number
  exp: number
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = ''

  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')
}

function base64UrlToBytes(value: string) {
  const base64 = value
    .replaceAll('-', '+')
    .replaceAll('_', '/')
    .padEnd(Math.ceil(value.length / 4) * 4, '=')

  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }

  return bytes
}

function textToBase64Url(value: string) {
  return bytesToBase64Url(new TextEncoder().encode(value))
}

function base64UrlToText(value: string) {
  return new TextDecoder().decode(base64UrlToBytes(value))
}

function timingSafeEqualBase64Url(left: string, right: string) {
  const leftBytes = base64UrlToBytes(left)
  const rightBytes = base64UrlToBytes(right)

  const length = Math.max(leftBytes.length, rightBytes.length)
  let diff = leftBytes.length ^ rightBytes.length

  for (let index = 0; index < length; index += 1) {
    diff |= (leftBytes[index] ?? 0) ^ (rightBytes[index] ?? 0)
  }

  return diff === 0
}

function normalizePbkdf2Iterations(iterations?: number) {
  if (!Number.isFinite(iterations) || !iterations || iterations <= 0) {
    return defaultIterations
  }

  return Math.min(Math.floor(iterations), maxPbkdf2Iterations)
}

function getJwtSecret(env: CloudflareEnv) {
  const secret = env.NUXT_JWT_SECRET

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
    {
      name: 'HMAC',
      hash: 'SHA-256'
    },
    false,
    ['sign', 'verify']
  )
}

async function signHmac(value: string, secret: string) {
  const key = await getHmacKey(secret)
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value))

  return bytesToBase64Url(new Uint8Array(signature))
}

async function verifyHmac(value: string, signature: string, secret: string) {
  const key = await getHmacKey(secret)

  return crypto.subtle.verify(
    'HMAC',
    key,
    base64UrlToBytes(signature),
    new TextEncoder().encode(value)
  )
}

export function generateSalt() {
  const salt = new Uint8Array(16)
  crypto.getRandomValues(salt)

  return bytesToBase64Url(salt)
}

export async function hashPassword(password: string, salt: string, iterations = defaultIterations) {
  const safeIterations = normalizePbkdf2Iterations(iterations)

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
      iterations: safeIterations
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
  const safeIterations = normalizePbkdf2Iterations(iterations)
  const hash = await hashPassword(password, salt, safeIterations)

  return timingSafeEqualBase64Url(hash, storedHash)
}

export function getPasswordIterations() {
  return defaultIterations
}

export async function signAuthToken(
  user: Pick<User, 'id' | 'username' | 'role'>,
  env: CloudflareEnv
) {
  const now = Math.floor(Date.now() / 1000)
  const ttlSeconds = Number(env.NUXT_AUTH_TOKEN_TTL_SECONDS || defaultTtlSeconds)
  const expiresIn = Number.isFinite(ttlSeconds) && ttlSeconds > 0 ? ttlSeconds : defaultTtlSeconds

  const header = textToBase64Url(
    JSON.stringify({
      alg: 'HS256',
      typ: 'JWT'
    })
  )

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

  try {
    const parsedHeader = JSON.parse(base64UrlToText(header)) as {
      alg?: string
      typ?: string
    }

    if (parsedHeader.alg !== 'HS256' || parsedHeader.typ !== 'JWT') {
      return null
    }

    const body = `${header}.${payload}`
    const isValidSignature = await verifyHmac(body, signature, getJwtSecret(env))

    if (!isValidSignature) {
      return null
    }

    const claims = JSON.parse(base64UrlToText(payload)) as Partial<AuthClaims>
    const now = Math.floor(Date.now() / 1000)

    if (
      !claims.sub ||
      typeof claims.username !== 'string' ||
      (claims.role !== 'OWNER' && claims.role !== 'MEMBER') ||
      typeof claims.iat !== 'number' ||
      typeof claims.exp !== 'number' ||
      claims.exp <= now
    ) {
      return null
    }

    return {
      sub: claims.sub,
      username: claims.username,
      role: claims.role
    }
  } catch {
    return null
  }
}
