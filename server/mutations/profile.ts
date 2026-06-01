import { eq } from 'drizzle-orm'
import { GraphQLError } from 'graphql'

import type { UpdateProfileInput } from '../../shared/types/auth'
import { users } from '../models/schema'
import type { GraphQLContext } from '../routes/graph'
import { normalizeUserRole, requirePermission } from '../utils/auth'

type UpdateProfileArgs = {
  input: UpdateProfileInput
}

function normalizeText(value: string | null | undefined, maxLength: number, label: string) {
  if (value === undefined) return undefined

  const normalized = value?.trim() || null

  if (normalized && normalized.length > maxLength) {
    throw new GraphQLError(`${label} must be ${maxLength} characters or less`)
  }

  return normalized
}

function normalizeUrl(value: string | null | undefined, maxLength: number, label: string) {
  const normalized = normalizeText(value, maxLength, label)

  if (normalized) {
    try {
      new URL(normalized)
    } catch {
      throw new GraphQLError(`${label} must be a valid URL`)
    }
  }

  return normalized
}

export const profileMutations = {
  updateMyProfile: async (
    _parent: unknown,
    args: UpdateProfileArgs,
    context: GraphQLContext
  ) => {
    const userId = requirePermission(context, 'profile:update')
    const displayName = normalizeText(args.input.displayName, 80, 'Display name')
    const bio = normalizeText(args.input.bio, 280, 'Bio')
    const website = normalizeUrl(args.input.website, 200, 'Website')
    const avatarUrl = normalizeUrl(args.input.avatarUrl, 500, 'Avatar URL')

    const [user] = await context.db
      .update(users)
      .set({
        ...(displayName !== undefined ? { displayName } : {}),
        ...(bio !== undefined ? { bio } : {}),
        ...(website !== undefined ? { website } : {}),
        ...(avatarUrl !== undefined ? { avatarUrl } : {}),
        updatedAt: new Date().toISOString()
      })
      .where(eq(users.id, userId))
      .returning()

    if (!user) {
      throw new GraphQLError('Profile not found')
    }

    return {
      id: user.id,
      username: user.username,
      role: normalizeUserRole(user.role),
      displayName: user.displayName,
      bio: user.bio,
      website: user.website,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt
    }
  }
}
