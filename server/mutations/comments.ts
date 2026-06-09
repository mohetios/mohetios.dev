import { eq } from 'drizzle-orm'
import { GraphQLError } from 'graphql'

import type { GraphQLContext } from '../routes/graph'
import { comments } from '../models/schema'
import {
  createPendingComment,
  queueCommentStatusEmail
} from '../services/comments/create-comment'
import { normalizeAdminCommentRow } from '../utils/comment-map'
import { normalizeCommentBody } from '../utils/comment-text'
import { requirePermission } from '../utils/auth'

type CreateCommentArgs = {
  input: {
    targetType: string
    targetPath: string
    targetTitle: string
    parentId?: string | null
    authorName: string
    authorEmail: string
    body: string
    turnstileToken: string
  }
}

type CommentIdArgs = {
  id: string
}

type MarkCommentSpamArgs = {
  id: string
  reason?: string | null
}

type UpdateCommentArgs = {
  id: string
  body: string
}

async function getCommentOrThrow(context: GraphQLContext, id: string) {
  const [comment] = await context.db
    .select()
    .from(comments)
    .where(eq(comments.id, id))
    .limit(1)

  if (!comment) {
    throw new GraphQLError('Comment not found')
  }

  return comment
}

export const commentMutations = {
  createComment: async (_parent: unknown, args: CreateCommentArgs, context: GraphQLContext) => {
    return createPendingComment(context, args.input)
  },

  approveComment: async (_parent: unknown, args: CommentIdArgs, context: GraphQLContext) => {
    const userId = requirePermission(context, 'comments:moderate')
    const comment = await getCommentOrThrow(context, args.id)

    if (comment.status === 'APPROVED') {
      return normalizeAdminCommentRow(comment)
    }

    const now = Date.now()

    const [updated] = await context.db
      .update(comments)
      .set({
        status: 'APPROVED',
        approvedAt: now,
        approvedBy: userId,
        updatedAt: now
      })
      .where(eq(comments.id, comment.id))
      .returning()

    if (!updated) {
      throw new GraphQLError('Comment could not be approved')
    }

    await queueCommentStatusEmail(context, updated.id, 'COMMENT_APPROVED_EMAIL')

    return normalizeAdminCommentRow(updated)
  },

  markCommentSpam: async (_parent: unknown, args: MarkCommentSpamArgs, context: GraphQLContext) => {
    const userId = requirePermission(context, 'comments:moderate')
    const comment = await getCommentOrThrow(context, args.id)
    const reason = args.reason?.trim() || null

    if (reason && reason.length > 500) {
      throw new GraphQLError('Reason must be 500 characters or less')
    }

    const now = Date.now()

    const [updated] = await context.db
      .update(comments)
      .set({
        status: 'SPAM',
        statusReason: reason,
        spammedAt: now,
        spammedBy: userId,
        updatedAt: now
      })
      .where(eq(comments.id, comment.id))
      .returning()

    if (!updated) {
      throw new GraphQLError('Comment could not be marked as spam')
    }

    await queueCommentStatusEmail(context, updated.id, 'COMMENT_MARKED_SPAM_EMAIL')

    return normalizeAdminCommentRow(updated)
  },

  deleteComment: async (_parent: unknown, args: CommentIdArgs, context: GraphQLContext) => {
    const userId = requirePermission(context, 'comments:moderate')
    const comment = await getCommentOrThrow(context, args.id)
    const now = Date.now()

    const [updated] = await context.db
      .update(comments)
      .set({
        status: 'DELETED',
        deletedAt: now,
        deletedBy: userId,
        updatedAt: now
      })
      .where(eq(comments.id, comment.id))
      .returning()

    if (!updated) {
      throw new GraphQLError('Comment could not be deleted')
    }

    return normalizeAdminCommentRow(updated)
  },

  updateComment: async (_parent: unknown, args: UpdateCommentArgs, context: GraphQLContext) => {
    const userId = requirePermission(context, 'comments:moderate')
    const comment = await getCommentOrThrow(context, args.id)
    const body = normalizeCommentBody(args.body)
    const now = Date.now()

    const [updated] = await context.db
      .update(comments)
      .set({
        body,
        editedAt: now,
        editedBy: userId,
        updatedAt: now
      })
      .where(eq(comments.id, comment.id))
      .returning()

    if (!updated) {
      throw new GraphQLError('Comment could not be updated')
    }

    return normalizeAdminCommentRow(updated)
  }
}
