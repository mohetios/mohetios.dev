const defaultIterations = 210000

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

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
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
