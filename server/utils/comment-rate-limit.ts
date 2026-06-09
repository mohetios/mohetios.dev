import { and, count, eq, gte, isNull } from 'drizzle-orm'
import { GraphQLError } from 'graphql'

import { COMMENT_LIMITS } from '../../shared/constants/comments'
import type { AppDb } from '../models/client'
import { comments } from '../models/schema'

type RateLimitInput = {
  ipHash: string
  emailHash: string
  depth: number
}

export async function enforceCommentRateLimit(db: AppDb, input: RateLimitInput) {
  const now = Date.now()
  const { rateLimit } = COMMENT_LIMITS

  const ipWindowStart = now - rateLimit.commentsPerIpWindowMs
  const emailWindowStart = now - rateLimit.commentsPerEmailWindowMs
  const replyWindowStart = now - rateLimit.repliesPerIpWindowMs

  const [ipCountRow] = await db
    .select({ value: count() })
    .from(comments)
    .where(and(eq(comments.ipHash, input.ipHash), gte(comments.createdAt, ipWindowStart)))

  if ((ipCountRow?.value ?? 0) >= rateLimit.commentsPerIpMax) {
    throw new GraphQLError('Too many comments. Please try again later.')
  }

  const [emailCountRow] = await db
    .select({ value: count() })
    .from(comments)
    .where(
      and(eq(comments.authorEmailHash, input.emailHash), gte(comments.createdAt, emailWindowStart))
    )

  if ((emailCountRow?.value ?? 0) >= rateLimit.commentsPerEmailMax) {
    throw new GraphQLError('Too many comments from this email. Please try again later.')
  }

  if (input.depth === 1) {
    const [replyCountRow] = await db
      .select({ value: count() })
      .from(comments)
      .where(
        and(
          eq(comments.ipHash, input.ipHash),
          eq(comments.depth, 1),
          gte(comments.createdAt, replyWindowStart)
        )
      )

    if ((replyCountRow?.value ?? 0) >= rateLimit.repliesPerIpMax) {
      throw new GraphQLError('Too many replies. Please try again later.')
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
