import type { Comment } from '../models/schema'

type PublicCommentRow = {
  id: string
  targetPath: string
  parentId: string | null
  depth: number
  authorName: string
  body: string
  createdAt: number
  replies: PublicCommentRow[]
}

type AdminCommentRow = {
  id: string
  targetType: string
  targetPath: string
  targetTitle: string
  parentId: string | null
  depth: number
  authorName: string
  authorEmail: string
  body: string
  bodyOriginal: string
  status: string
  statusReason: string | null
  approvedAt: number | null
  approvedBy: string | null
  spammedAt: number | null
  spammedBy: string | null
  deletedAt: number | null
  deletedBy: string | null
  editedAt: number | null
  editedBy: string | null
  createdAt: number
  updatedAt: number
  preview: string
  parentPreview: string | null
}

export function normalizePublicCommentRow(
  row: Pick<
    Comment,
    'id' | 'targetPath' | 'parentId' | 'depth' | 'authorName' | 'body' | 'createdAt'
  >
): PublicCommentRow {
  return {
    id: row.id,
    targetPath: row.targetPath,
    parentId: row.parentId,
    depth: row.depth,
    authorName: row.authorName,
    body: row.body,
    createdAt: row.createdAt,
    replies: []
  }
}

export function normalizeAdminCommentRow(
  row: Comment,
  parentPreview: string | null = null
): AdminCommentRow {
  return {
    id: row.id,
    targetType: row.targetType,
    targetPath: row.targetPath,
    targetTitle: row.targetTitle,
    parentId: row.parentId,
    depth: row.depth,
    authorName: row.authorName,
    authorEmail: row.authorEmail,
    body: row.body,
    bodyOriginal: row.bodyOriginal,
    status: row.status,
    statusReason: row.statusReason,
    approvedAt: row.approvedAt,
    approvedBy: row.approvedBy,
    spammedAt: row.spammedAt,
    spammedBy: row.spammedBy,
    deletedAt: row.deletedAt,
    deletedBy: row.deletedBy,
    editedAt: row.editedAt,
    editedBy: row.editedBy,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    preview: row.body.length > 120 ? `${row.body.slice(0, 119).trim()}…` : row.body,
    parentPreview
  }
}
