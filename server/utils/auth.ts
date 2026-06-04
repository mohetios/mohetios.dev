import { GraphQLError } from 'graphql'
import { getCookie, getHeader, type H3Event } from 'h3'

import { canRole, type Permission, type UserRole } from '../../shared/constants/permissions'
import type { GraphQLContext } from '../routes/graph'

const usernamePattern = /^[a-z0-9][a-z0-9._-]{2,31}$/i
const tokenCookieKey = 'mohetios_auth_token'

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

  if (authorization?.startsWith('Bearer ')) {
    return authorization.slice('Bearer '.length).trim() || null
  }

  return getCookie(event, tokenCookieKey)?.trim() || null
}

export function normalizeUserRole(role: unknown): Exclude<UserRole, 'GUEST'> {
  if (role === 'OWNER' || role === 'ADMIN') return 'OWNER'

  return 'MEMBER'
}

export function requireAuth(context: GraphQLContext) {
  if (!context.userId) {
    throw new GraphQLError('Authentication required', {
      extensions: {
        code: 'UNAUTHENTICATED',
        http: {
          status: 401
        }
      }
    })
  }

  const { userId } = context

  return userId
}

export function requirePermission(
  context: { userId?: string; userRole?: UserRole },
  permission: Permission
) {
  const userId = requireAuth(context as GraphQLContext)

  if (!canRole(context.userRole, permission)) {
    throw new GraphQLError('Permission denied', {
      extensions: {
        code: 'FORBIDDEN',
        http: {
          status: 403
        }
      }
    })
  }

  return userId
}
