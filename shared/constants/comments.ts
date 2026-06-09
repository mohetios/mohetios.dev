export const COMMENT_TARGET_TYPES = ['BLOG_POST', 'LAB_NOTE', 'PROJECT'] as const

export type CommentTargetType = (typeof COMMENT_TARGET_TYPES)[number]

export function isCommentTargetType(value: string): value is CommentTargetType {
  return COMMENT_TARGET_TYPES.includes(value as CommentTargetType)
}

export const COMMENT_STATUSES = ['PENDING', 'APPROVED', 'SPAM', 'DELETED'] as const
export type CommentStatus = (typeof COMMENT_STATUSES)[number]

export const COMMENT_LIMITS = {
  authorNameMin: 2,
  authorNameMax: 80,
  emailMax: 254,
  bodyMin: 10,
  bodyMax: 4000,
  maxLinks: 2,
  publicLimit: 50,
  adminDefaultLimit: 50,
  adminMaxLimit: 100
} as const

export const COMMENT_ERROR_CODES = {
  RATE_LIMIT_IP: 'COMMENT_RATE_LIMIT_IP',
  RATE_LIMIT_EMAIL: 'COMMENT_RATE_LIMIT_EMAIL',
  RATE_LIMIT_REPLY: 'COMMENT_RATE_LIMIT_REPLY'
} as const
