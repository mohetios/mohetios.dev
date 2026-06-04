import type { inboxMessages } from '../models/schema'

export function createLeadPreview(bodyText: string) {
  const clean = bodyText.replace(/\s+/g, ' ').trim()
  return clean.length > 220 ? `${clean.slice(0, 217)}...` : clean
}

export function createLeadTitle(message: typeof inboxMessages.$inferSelect) {
  return message.subject || `${message.senderName} opportunity`
}

function createLeadTags(message: typeof inboxMessages.$inferSelect) {
  return [
    message.kind.toLowerCase(),
    message.source.toLowerCase(),
    message.priority.toLowerCase()
  ].filter(Boolean)
}

function getLastContactedAt(message: typeof inboxMessages.$inferSelect) {
  if (message.status === 'REPLIED') {
    return message.lastActivityAt
  }

  return null
}

export function normalizeLeadRow(message: typeof inboxMessages.$inferSelect) {
  return {
    id: message.id,
    title: createLeadTitle(message),
    summary: createLeadPreview(message.bodyText),
    source: message.source,
    status: message.status,
    kind: message.kind,
    priority: message.priority,
    name: message.senderName,
    email: message.senderEmail,
    company: message.senderCompany,
    website: message.senderWebsite,
    subject: message.subject,
    bodyText: message.bodyText,
    relatedInboxMessageId: message.id,
    relatedInboxThreadId: message.id,
    threadKey: message.threadKey,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
    lastActivityAt: message.lastActivityAt,
    lastContactedAt: getLastContactedAt(message),
    tags: createLeadTags(message)
  }
}
