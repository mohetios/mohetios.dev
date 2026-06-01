import { createError } from 'h3'

import type { GraphqlContext } from '../graphql/types'

export function optionalAuth(context: GraphqlContext) {
  return context.user
}

export function requireAuth(context: GraphqlContext) {
  if (!context.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    })
  }

  return context.user
}
