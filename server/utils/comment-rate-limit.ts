import { and, count, eq, gte, isNull } from 'drizzle-orm'
import { GraphQLError } from 'graphql'

import { COMMENT_ERROR_CODES } from '../../shared/constants/comments'
import { PUBLIC_MUTATION_RATE_LIMITS } from '../../shared/constants/security'
import type { AppDb } from '../models/client'
import { comments } from '../models/schema'
import {
  getRateLimitWindowStart,
  isRateLimitExceeded,
  throwRateLimitGraphQLError
} from './security'

type RateLimitInput = {
  ipHash: string
  emailHash: string
  depth: number
}

const commentRateLimits = PUBLIC_MUTATION_RATE_LIMITS.createComment

export async function enforceCommentRateLimit(db: AppDb, input: RateLimitInput) {
  const now = Date.now()

  const [ipCountRow] = await db
    .select({ value: count() })
    .from(comments)
    .where(
      and(
        eq(comments.ipHash, input.ipHash),
        gte(comments.createdAt, getRateLimitWindowStart(now, commentRateLimits.commentsPerIp))
      )
    )

  if (isRateLimitExceeded(ipCountRow?.value ?? 0, commentRateLimits.commentsPerIp)) {
    throwRateLimitGraphQLError(
      'Too many comments. Please try again later.',
      COMMENT_ERROR_CODES.RATE_LIMIT_IP
    )
  }

  const [emailCountRow] = await db
    .select({ value: count() })
    .from(comments)
    .where(
      and(
        eq(comments.authorEmailHash, input.emailHash),
        gte(
          comments.createdAt,
          getRateLimitWindowStart(now, commentRateLimits.commentsPerEmail)
        )
      )
    )

  if (isRateLimitExceeded(emailCountRow?.value ?? 0, commentRateLimits.commentsPerEmail)) {
    throwRateLimitGraphQLError(
      'Too many comments from this email. Please try again later.',
      COMMENT_ERROR_CODES.RATE_LIMIT_EMAIL
    )
  }

  if (input.depth === 1) {
    const [replyCountRow] = await db
      .select({ value: count() })
      .from(comments)
      .where(
        and(
          eq(comments.ipHash, input.ipHash),
          eq(comments.depth, 1),
          gte(
            comments.createdAt,
            getRateLimitWindowStart(now, commentRateLimits.repliesPerIp)
          )
        )
      )

    if (isRateLimitExceeded(replyCountRow?.value ?? 0, commentRateLimits.repliesPerIp)) {
      throwRateLimitGraphQLError(
        'Too many replies. Please try again later.',
        COMMENT_ERROR_CODES.RATE_LIMIT_REPLY
      )
    }
  }
}

export async function assertValidCommentParent(
  db: AppDb,
  parentId: string | null | undefined,
  targetPath: string
) {
  if (!parentId) {
    return { parentId: null, depth: 0 }
  }

  const [parent] = await db
    .select({
      id: comments.id,
      parentId: comments.parentId,
      depth: comments.depth,
      targetPath: comments.targetPath,
      status: comments.status
    })
    .from(comments)
    .where(and(eq(comments.id, parentId), isNull(comments.deletedAt)))
    .limit(1)

  if (!parent) {
    throw new GraphQLError('Reply target was not found')
  }

  if (parent.targetPath !== targetPath) {
    throw new GraphQLError('Reply target is invalid')
  }

  if (parent.status === 'DELETED' || parent.status === 'SPAM') {
    throw new GraphQLError('Replies are not allowed on this comment')
  }

  if (parent.parentId || parent.depth !== 0) {
    throw new GraphQLError('Only one level of replies is allowed')
  }

  return { parentId: parent.id, depth: 1 }
}
