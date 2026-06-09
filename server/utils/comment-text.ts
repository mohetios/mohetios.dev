import { GraphQLError } from 'graphql'

import { COMMENT_LIMITS } from '../../shared/constants/comments'

const linkPattern = /(?:https?:\/\/|www\.)\S+/gi
const htmlTagPattern = /<\/?[a-z][\s\S]*>/i

export function countCommentLinks(value: string) {
  return (value.match(linkPattern) || []).length
}

export function normalizeCommentBody(value: string) {
  const normalized = value.trim()

  if (normalized.length < COMMENT_LIMITS.bodyMin) {
    throw new GraphQLError(`Comment must be at least ${COMMENT_LIMITS.bodyMin} characters`)
  }

  if (normalized.length > COMMENT_LIMITS.bodyMax) {
    throw new GraphQLError(`Comment must be ${COMMENT_LIMITS.bodyMax} characters or less`)
  }

  if (htmlTagPattern.test(normalized)) {
    throw new GraphQLError('HTML is not allowed in comments')
  }

  const linkCount = countCommentLinks(normalized)

  if (linkCount > COMMENT_LIMITS.maxLinks) {
    throw new GraphQLError(`Comments may include at most ${COMMENT_LIMITS.maxLinks} links`)
  }

  return normalized
}

export function normalizeCommentAuthorName(value: string) {
  const normalized = value.trim()

  if (normalized.length < COMMENT_LIMITS.authorNameMin) {
    throw new GraphQLError(
      `Name must be at least ${COMMENT_LIMITS.authorNameMin} characters`
    )
  }

  if (normalized.length > COMMENT_LIMITS.authorNameMax) {
    throw new GraphQLError(`Name must be ${COMMENT_LIMITS.authorNameMax} characters or less`)
  }

  return normalized
}

export function normalizeCommentEmail(value: string) {
  const email = value.trim()

  if (!email) {
    throw new GraphQLError('Email is required')
  }

  if (email.length > COMMENT_LIMITS.emailMax) {
    throw new GraphQLError(`Email must be ${COMMENT_LIMITS.emailMax} characters or less`)
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new GraphQLError('Email must be valid')
  }

  return email.toLowerCase()
}

export function normalizeCommentTargetPath(value: string) {
  const normalized = value.trim()

  if (!normalized || normalized.length > 512) {
    throw new GraphQLError('Target path is invalid')
  }

  if (!normalized.startsWith('/')) {
    throw new GraphQLError('Target path is invalid')
  }

  return normalized
}

export function normalizeCommentTargetTitle(value: string) {
  const normalized = value.trim()

  if (!normalized || normalized.length > 240) {
    throw new GraphQLError('Target title is invalid')
  }

  return normalized
}

export function createCommentPreview(body: string, maxLength = 120) {
  if (body.length <= maxLength) {
    return body
  }

  return `${body.slice(0, maxLength - 1).trim()}…`
}
