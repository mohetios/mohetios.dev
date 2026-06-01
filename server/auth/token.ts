import { getHeader, type H3Event } from 'h3'

export function getBearerToken(event: H3Event) {
  const authorization = getHeader(event, 'authorization')

  if (!authorization?.startsWith('Bearer ')) {
    return null
  }

  return authorization.slice('Bearer '.length).trim() || null
}
