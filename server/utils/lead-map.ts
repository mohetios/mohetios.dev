import type { inboxMessages } from '../models/schema'

type LeadStatus = 'NEW' | 'QUALIFIED' | 'FOLLOW_UP' | 'WON' | 'LOST' | 'ARCHIVED'
type LeadPriority = 'LOW' | 'MEDIUM' | 'HIGH'

function createLeadPreview(bodyText: string) {
  const clean = bodyText.replace(/\s+/g, ' ').trim()
  return clean.length > 220 ? `${clean.slice(0, 217)}...` : clean
}

function resolveLeadStatus(message: typeof inboxMessages.$inferSelect): LeadStatus {
  return message.leadStatus || 'NEW'
}

function resolveLeadPriority(message: typeof inboxMessages.$inferSelect): LeadPriority {
  if (message.leadPriority) {
    return message.leadPriority
  }

  if (message.priority === 'LOW') {
    return 'LOW'
  }

  if (message.priority === 'HIGH') {
    return 'HIGH'
  }

  return 'MEDIUM'
}

export function normalizeLeadRow(message: typeof inboxMessages.$inferSelect) {
  return {
    id: message.id,
    inboxMessageId: message.id,
    source: message.source,
    status: resolveLeadStatus(message),
    priority: resolveLeadPriority(message),
    name: message.senderName,
    email: message.senderEmail,
    company: message.senderCompany,
    subject: message.subject,
    summary: createLeadPreview(message.bodyText),
    lastActivityAt: message.lastActivityAt,
    createdAt: message.createdAt,
    nextFollowUpAt: message.leadNextFollowUpAt,
    notes: message.leadNotes
  }
}
