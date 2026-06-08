import { GraphQLError } from 'graphql'

import type { GraphQLContext } from '../routes/graph'

function normalizeTurnstileToken(value: string) {
  const normalized = value.trim()

  if (!normalized) {
    throw new GraphQLError('Verification token is required')
  }

  if (normalized.length > 2048) {
    throw new GraphQLError('Verification token must be 2048 characters or less')
  }

  return normalized
}

export async function requireTurnstileToken(token: string, context: GraphQLContext) {
  const normalizedToken = normalizeTurnstileToken(token)
  const result = await verifyTurnstileToken(normalizedToken, context.event)

  if (!result.success) {
    throw new GraphQLError('Verification failed. Please try again.')
  }
}
