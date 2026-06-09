import { GraphQLError } from 'graphql'

import type { EmailDeliveryJob } from '../../../shared/contracts/email'
import type { AdminNotificationJob } from '../../../shared/contracts/notifications'
import {
  isCommentTargetType,
  type CommentTargetType
} from '../../../shared/constants/comments'
import type { GraphQLContext } from '../../routes/graph'
import { comments } from '../../models/schema'
import { createAdminNotification } from '../notifications/create-admin-notification'
import { createId } from '../../utils/id'
import { hashCommentEmail, getCommentRequestHashes } from '../../utils/comment-hash'
import {
  assertValidCommentParent,
  enforceCommentRateLimit
} from '../../utils/comment-rate-limit'
import {
  createCommentPreview,
  normalizeCommentAuthorName,
  normalizeCommentBody,
  normalizeCommentEmail,
  normalizeCommentTargetPath,
  normalizeCommentTargetTitle
} from '../../utils/comment-text'
import { requireTurnstileToken } from '../../utils/turnstile'

type CreateCommentInput = {
  targetType: CommentTargetType | string
  targetPath: string
  targetTitle: string
  parentId?: string | null
  authorName: string
  authorEmail: string
  body: string
  turnstileToken: string
}

async function queueCommentConfirmationEmail(context: GraphQLContext, commentId: string) {
  if (!context.env.EMAIL_DELIVERY_QUEUE) {
    console.warn('EMAIL_DELIVERY_QUEUE binding is missing')
    return
  }

  try {
    await context.env.EMAIL_DELIVERY_QUEUE.send({
      type: 'COMMENT_RECEIVED_CONFIRMATION_EMAIL',
      commentId
    } satisfies EmailDeliveryJob)
  } catch (error) {
    console.error('Comment confirmation email queue failed', { commentId, error })
  }
}

export async function createPendingComment(context: GraphQLContext, input: CreateCommentInput) {
  if (!isCommentTargetType(input.targetType)) {
    throw new GraphQLError('Target type is invalid')
  }

  const targetType = input.targetType

  const targetPath = normalizeCommentTargetPath(input.targetPath)
  const targetTitle = normalizeCommentTargetTitle(input.targetTitle)
  const authorName = normalizeCommentAuthorName(input.authorName)
  const authorEmail = normalizeCommentEmail(input.authorEmail)
  const body = normalizeCommentBody(input.body)

  await requireTurnstileToken(input.turnstileToken, context)

  const { parentId, depth } = await assertValidCommentParent(
    context.db,
    input.parentId,
    targetPath
  )

  const { ipHash, userAgentHash } = await getCommentRequestHashes(context)
  const authorEmailHash = await hashCommentEmail(authorEmail, context.env.NUXT_JWT_SECRET)

  await enforceCommentRateLimit(context.db, {
    ipHash,
    emailHash: authorEmailHash,
    depth
  })

  const now = Date.now()
  const commentId = createId()

  const [created] = await context.db
    .insert(comments)
    .values({
      id: commentId,
      targetType,
      targetPath,
      targetTitle,
      parentId,
      depth,
      authorName,
      authorEmail,
      authorEmailHash,
      authorUserId: null,
      bodyOriginal: body,
      body,
      status: 'PENDING',
      statusReason: null,
      ipHash,
      userAgentHash,
      approvedAt: null,
      approvedBy: null,
      spammedAt: null,
      spammedBy: null,
      deletedAt: null,
      deletedBy: null,
      editedAt: null,
      editedBy: null,
      createdAt: now,
      updatedAt: now
    })
    .returning()

  if (!created) {
    throw new GraphQLError('Comment could not be created')
  }

  const notification = await createAdminNotification(context.db, {
    type: 'NEW_COMMENT',
    title: 'New comment waiting for review',
    body: `${authorName} commented on ${targetTitle}: ${createCommentPreview(body)}`,
    url: `/dashboard/comments?status=PENDING&comment=${commentId}`,
    entityType: 'comment',
    entityId: commentId
  })

  if (context.env.ADMIN_NOTIFICATION_QUEUE) {
    try {
      await context.env.ADMIN_NOTIFICATION_QUEUE.send({
        type: 'NEW_COMMENT',
        commentId,
        notificationId: notification.id
      } satisfies AdminNotificationJob)
    } catch (error) {
      console.error('Comment admin notification queue failed', { commentId, error })
    }
  } else {
    console.warn('ADMIN_NOTIFICATION_QUEUE binding is missing')
  }

  await queueCommentConfirmationEmail(context, commentId)

  return {
    ok: true,
    message: 'Thanks — your comment is waiting for review.',
    commentId
  }
}

export async function queueCommentStatusEmail(
  context: GraphQLContext,
  commentId: string,
  type: Extract<
    EmailDeliveryJob['type'],
    'COMMENT_APPROVED_EMAIL' | 'COMMENT_MARKED_SPAM_EMAIL'
  >
) {
  if (!context.env.EMAIL_DELIVERY_QUEUE) {
    console.warn('EMAIL_DELIVERY_QUEUE binding is missing')
    return
  }

  try {
    await context.env.EMAIL_DELIVERY_QUEUE.send({ type, commentId } satisfies EmailDeliveryJob)
  } catch (error) {
    console.error('Comment status email queue failed', { commentId, type, error })
  }
}
