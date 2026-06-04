import type { inboxMessages, inboxReplies } from '../models/schema'

export function createInboxPreview(bodyText: string) {
  const clean = bodyText.replace(/\s+/g, ' ').trim()
  return clean.length > 160 ? `${clean.slice(0, 157)}...` : clean
}

export function normalizeInboxMessageRow(message: typeof inboxMessages.$inferSelect) {
  return {
    id: message.id,
    source: message.source,
    status: message.status,
    kind: message.kind,
    priority: message.priority,
    senderName: message.senderName,
    senderEmail: message.senderEmail,
    senderCompany: message.senderCompany,
    senderWebsite: message.senderWebsite,
    subject: message.subject,
    preview: createInboxPreview(message.bodyText),
    bodyText: message.bodyText,
    bodyHtml: message.bodyHtml,
    rawMessageId: message.rawMessageId,
    inReplyTo: message.inReplyTo,
    threadKey: message.threadKey,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
    lastActivityAt: message.lastActivityAt
  }
}

export function normalizeInboxReplyRow(reply: typeof inboxReplies.$inferSelect) {
  return {
    id: reply.id,
    inboxMessageId: reply.inboxMessageId,
    fromEmail: reply.fromEmail,
    toEmail: reply.toEmail,
    subject: reply.subject,
    bodyText: reply.bodyText,
    providerMessageId: reply.providerMessageId,
    status: reply.status,
    error: reply.error,
    createdAt: reply.createdAt,
    sentAt: reply.sentAt
  }
}

export function createInboxThreadEvents(
  message: ReturnType<typeof normalizeInboxMessageRow> | null,
  replies: Array<ReturnType<typeof normalizeInboxReplyRow>>
) {
  if (!message) return []

  return [
    {
      id: `message:${message.id}`,
      type: 'inbound_message',
      authorName: message.senderName,
      authorEmail: message.senderEmail,
      bodyText: message.bodyText,
      createdAt: message.createdAt,
      isPrivate: false,
      deliveryStatus: 'received'
    },
    ...replies.map((reply) => ({
      id: `reply:${reply.id}`,
      type: 'outbound_reply',
      authorName: 'Mohetios',
      authorEmail: reply.fromEmail,
      bodyText: reply.bodyText,
      createdAt: reply.sentAt || reply.createdAt,
      isPrivate: false,
      deliveryStatus: reply.status.toLowerCase()
    }))
  ].sort((a, b) => a.createdAt - b.createdAt)
}
