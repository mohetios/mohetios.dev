import { GraphQLError } from 'graphql'
import { getHeader, type H3Event } from 'h3'

import type { GraphQLContext } from '../routes/graph'

const usernamePattern = /^[a-z0-9][a-z0-9._-]{2,31}$/i

export function normalizeUsername(username: string) {
  return username.trim().toLowerCase()
}

export function validateUsername(username: string) {
  if (!usernamePattern.test(username)) {
    throw new GraphQLError(
      'Username must be 3-32 characters and use only letters, numbers, dots, underscores, or hyphens'
    )
  }
}

export function validatePassword(password: string) {
  if (password.length < 8) {
    throw new GraphQLError('Password must be at least 8 characters')
  }
}

export function getBearerToken(event: H3Event) {
  const authorization = getHeader(event, 'authorization')

  if (!authorization?.startsWith('Bearer ')) {
    return null
  }

  return authorization.slice('Bearer '.length).trim() || null
}

export function requireAuth(context: GraphQLContext) {
  if (!context.userId) {
    throw new GraphQLError('Authentication required')
  }

  return context.userId
}
