export type NormalizedEmail = {
  senderName: string
  senderEmail: string
  subject: string
  bodyText: string
  bodyHtml?: string | null
  rawMessageId?: string | null
  inReplyTo?: string | null
  threadKey: string
}

export type EmailDeliveryJob =
  | {
      type: 'SEND_INBOX_REPLY'
      replyId: string
      inboxMessageId: string
    }
  | {
      type: 'SEND_NEWSLETTER_WELCOME'
      subscriberId: string
    }
  | {
      type: 'COMMENT_RECEIVED_CONFIRMATION_EMAIL'
      commentId: string
    }
  | {
      type: 'COMMENT_APPROVED_EMAIL'
      commentId: string
    }
  | {
      type: 'COMMENT_MARKED_SPAM_EMAIL'
      commentId: string
    }
