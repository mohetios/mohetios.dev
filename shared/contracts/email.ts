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
