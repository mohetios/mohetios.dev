import { and, asc, count, desc, eq, inArray, isNull, like, or } from 'drizzle-orm'
import { GraphQLError } from 'graphql'

import {
  COMMENT_LIMITS,
  COMMENT_STATUSES,
  type CommentStatus,
  type CommentTargetType
} from '../../shared/constants/comments'
import type { GraphQLContext } from '../routes/graph'
import { comments } from '../models/schema'
import { normalizeAdminCommentRow, normalizePublicCommentRow } from '../utils/comment-map'
import { requirePermission } from '../utils/auth'

type PublicCommentsArgs = {
  targetType: CommentTargetType | string
  targetPath: string
}

type AdminCommentsArgs = {
  status?: CommentStatus | string | null
  targetPath?: string | null
  search?: string | null
  limit?: number | null
  offset?: number | null
}

function clampLimit(value: number | null | undefined, max: number, fallback: number) {
  const normalized = value ?? fallback

  if (!Number.isFinite(normalized) || normalized < 1) {
    return fallback
  }

  return Math.min(Math.floor(normalized), max)
}

function clampOffset(value: number | null | undefined) {
  const normalized = value ?? 0

  if (!Number.isFinite(normalized) || normalized < 0) {
    return 0
  }

  return Math.floor(normalized)
}

export async function publicComments(
  _parent: unknown,
  args: PublicCommentsArgs,
  context: GraphQLContext
) {
  if (args.targetType !== 'BLOG_POST') {
    throw new GraphQLError('Target type is invalid')
  }

  const targetPath = args.targetPath.trim()

  if (!targetPath) {
    throw new GraphQLError('Target path is required')
  }

  const topLevelRows = await context.db
    .select({
      id: comments.id,
      targetPath: comments.targetPath,
      parentId: comments.parentId,
      depth: comments.depth,
      authorName: comments.authorName,
      body: comments.body,
      createdAt: comments.createdAt
    })
    .from(comments)
    .where(
      and(
        eq(comments.targetType, 'BLOG_POST'),
        eq(comments.targetPath, targetPath),
        eq(comments.status, 'APPROVED'),
        eq(comments.depth, 0),
        isNull(comments.parentId)
      )
    )
    .orderBy(asc(comments.createdAt))
    .limit(COMMENT_LIMITS.publicLimit)

  if (!topLevelRows.length) {
    return []
  }

  const parentIds = topLevelRows.map((row) => row.id)

  const replyRows = await context.db
    .select({
      id: comments.id,
      targetPath: comments.targetPath,
      parentId: comments.parentId,
      depth: comments.depth,
      authorName: comments.authorName,
      body: comments.body,
      createdAt: comments.createdAt
    })
    .from(comments)
    .where(
      and(
        eq(comments.status, 'APPROVED'),
        eq(comments.depth, 1),
        inArray(comments.parentId, parentIds)
      )
    )
    .orderBy(asc(comments.createdAt))

  const repliesByParent = new Map<string, ReturnType<typeof normalizePublicCommentRow>[]>()

  for (const reply of replyRows) {
    if (!reply.parentId) continue

    const bucket = repliesByParent.get(reply.parentId) || []
    bucket.push(normalizePublicCommentRow(reply))
    repliesByParent.set(reply.parentId, bucket)
  }

  return topLevelRows.map((row) => ({
    ...normalizePublicCommentRow(row),
    replies: repliesByParent.get(row.id) || []
  }))
}

function buildAdminSearchFilter(search: string | null | undefined) {
  const normalized = search?.trim()

  if (!normalized) {
    return undefined
  }

  const pattern = `%${normalized.replace(/[%_]/g, '')}%`

  return or(
    like(comments.authorName, pattern),
    like(comments.authorEmail, pattern),
    like(comments.body, pattern),
    like(comments.targetTitle, pattern),
    like(comments.targetPath, pattern)
  )
}

export async function adminComments(
  _parent: unknown,
  args: AdminCommentsArgs,
  context: GraphQLContext
) {
  requirePermission(context, 'comments:moderate')

  const limit = clampLimit(
    args.limit,
    COMMENT_LIMITS.adminMaxLimit,
    COMMENT_LIMITS.adminDefaultLimit
  )
  const offset = clampOffset(args.offset)
  const status =
    args.status && COMMENT_STATUSES.includes(args.status as CommentStatus)
      ? (args.status as CommentStatus)
      : null
  const targetPath = args.targetPath?.trim() || null
  const searchFilter = buildAdminSearchFilter(args.search)

  const filters = [
    status ? eq(comments.status, status) : undefined,
    targetPath ? eq(comments.targetPath, targetPath) : undefined,
    searchFilter
  ].filter(Boolean)

  const whereClause = filters.length ? and(...filters) : undefined

  const [totalRow] = await context.db.select({ value: count() }).from(comments).where(whereClause)

  const rows = await context.db
    .select()
    .from(comments)
    .where(whereClause)
    .orderBy(desc(comments.createdAt))
    .limit(limit)
    .offset(offset)

  const parentIds = rows.map((row) => row.parentId).filter((value): value is string => Boolean(value))

  const parentPreviewById = new Map<string, string>()

  if (parentIds.length) {
    const parents = await context.db
      .select({ id: comments.id, body: comments.body })
      .from(comments)
      .where(inArray(comments.id, parentIds))

    for (const parent of parents) {
      parentPreviewById.set(
        parent.id,
        parent.body.length > 80 ? `${parent.body.slice(0, 79).trim()}…` : parent.body
      )
    }
  }

  const [pendingRow] = await context.db
    .select({ value: count() })
    .from(comments)
    .where(eq(comments.status, 'PENDING'))

  const [approvedRow] = await context.db
    .select({ value: count() })
    .from(comments)
    .where(eq(comments.status, 'APPROVED'))

  const [spamRow] = await context.db
    .select({ value: count() })
    .from(comments)
    .where(eq(comments.status, 'SPAM'))

  const [deletedRow] = await context.db
    .select({ value: count() })
    .from(comments)
    .where(eq(comments.status, 'DELETED'))

  return {
    items: rows.map((row) =>
      normalizeAdminCommentRow(row, row.parentId ? parentPreviewById.get(row.parentId) || null : null)
    ),
    total: totalRow?.value ?? 0,
    limit,
    offset,
    summary: {
      pending: pendingRow?.value ?? 0,
      approved: approvedRow?.value ?? 0,
      spam: spamRow?.value ?? 0,
      deleted: deletedRow?.value ?? 0
    }
  }
}
