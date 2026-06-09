import { z } from 'zod'

import { COMMENT_LIMITS } from '../constants/comments'

const linkPattern = /(?:https?:\/\/|www\.)\S+/gi
const htmlTagPattern = /<\/?[a-z][\s\S]*>/i

function countCommentLinks(value: string) {
  return (value.match(linkPattern) || []).length
}

export type CommentFormValidationMessages = {
  name: string
  nameMax: string
  email: string
  emailMax: string
  comment: string
  commentMax: string
  htmlNotAllowed: string
  maxLinks: string
}

export function createCommentFormSchema(messages: CommentFormValidationMessages) {
  return z.object({
    authorName: z
      .string()
      .trim()
      .min(COMMENT_LIMITS.authorNameMin, messages.name)
      .max(COMMENT_LIMITS.authorNameMax, messages.nameMax),
    authorEmail: z
      .email(messages.email)
      .max(COMMENT_LIMITS.emailMax, messages.emailMax),
    body: z
      .string()
      .trim()
      .min(COMMENT_LIMITS.bodyMin, messages.comment)
      .max(COMMENT_LIMITS.bodyMax, messages.commentMax)
      .refine((value) => !htmlTagPattern.test(value), messages.htmlNotAllowed)
      .refine((value) => countCommentLinks(value) <= COMMENT_LIMITS.maxLinks, messages.maxLinks)
  })
}

export type CommentFormState = z.infer<ReturnType<typeof createCommentFormSchema>>
