export type InboxKind = 'lead' | 'collaboration' | 'personal' | 'support' | 'other' | 'spam'
export type InboxStatus = 'new' | 'open' | 'replied' | 'archived' | 'spam'
export type InboxSource = 'contact_form' | 'email'
export type BadgeColor = 'primary' | 'info' | 'success' | 'neutral' | 'warning' | 'error'

export type InboxMessage = {
  id: string
  source: InboxSource
  senderName: string
  senderEmail: string
  subject: string
  preview: string
  bodyText: string
  kind: InboxKind
  status: InboxStatus
  time: string
  senderCompany?: string | null
  senderWebsite?: string | null
  createdAt: number
}

export type InboxThreadStatus =
  | 'new'
  | 'open'
  | 'needs_reply'
  | 'replied'
  | 'archived'
  | 'spam'

export type InboxThreadSource = 'contact_form' | 'email'

export type InboxThreadEventType =
  | 'inbound'
  | 'outbound_reply'
  | 'internal_note'
  | 'ai_draft'
  | 'status_change'

export type InboxThreadEvent = {
  id: string
  type: InboxThreadEventType
  authorName: string
  authorEmail?: string
  bodyText: string
  time: string
  createdAt: number
  isPrivate?: boolean
  deliveryStatus?: 'draft' | 'sent' | 'failed' | 'not_applicable'
}

export function getThreadStatus(message: InboxMessage): InboxThreadStatus {
  if (message.status === 'new') return 'needs_reply'
  if (message.status === 'open') return 'needs_reply'
  return message.status
}

export function getThreadEvents(message: InboxMessage): InboxThreadEvent[] {
  const events: InboxThreadEvent[] = [
    {
      id: `${message.id}:inbound`,
      type: 'inbound',
      authorName: message.senderName,
      authorEmail: message.senderEmail,
      bodyText: message.bodyText,
      time: message.time,
      createdAt: message.createdAt,
      deliveryStatus: 'not_applicable'
    }
  ]

  if (['lead', 'collaboration'].includes(message.kind)) {
    events.push({
      id: `${message.id}:note:mock`,
      type: 'internal_note',
      authorName: 'Mohetios',
      bodyText: 'Potential collaboration or lead. Review context before replying.',
      time: 'Private note',
      createdAt: message.createdAt + 1,
      isPrivate: true,
      deliveryStatus: 'not_applicable'
    })
  }

  return events
}

export function getCategoryLabel(kind: InboxKind) {
  return kind.charAt(0).toUpperCase() + kind.slice(1)
}

export function getCategoryColor(kind: InboxKind): BadgeColor {
  return (
    {
      lead: 'primary',
      collaboration: 'success',
      personal: 'info',
      support: 'warning',
      other: 'neutral',
      spam: 'error'
    } satisfies Record<InboxKind, BadgeColor>
  )[kind]
}

export function getStatusLabel(status: InboxStatus) {
  return (
    {
      new: 'New',
      open: 'Open',
      replied: 'Replied',
      archived: 'Archived',
      spam: 'Spam'
    } satisfies Record<InboxStatus, string>
  )[status]
}

export function getThreadStatusLabel(status: InboxThreadStatus) {
  return (
    {
      new: 'New',
      open: 'Open',
      needs_reply: 'Needs reply',
      replied: 'Replied',
      archived: 'Archived',
      spam: 'Spam'
    } satisfies Record<InboxThreadStatus, string>
  )[status]
}

export function getStatusColor(status: InboxStatus | InboxThreadStatus): BadgeColor {
  return (
    {
      new: 'primary',
      open: 'neutral',
      needs_reply: 'warning',
      replied: 'success',
      archived: 'neutral',
      spam: 'error'
    } satisfies Record<InboxStatus | InboxThreadStatus, BadgeColor>
  )[status]
}

export function getSourceLabel(source: InboxSource) {
  return (
    {
      contact_form: 'Contact form',
      email: 'Email'
    } satisfies Record<InboxSource, string>
  )[source]
}

export function getSourceIcon(source: InboxSource) {
  return source === 'email' ? 'i-lucide-mail' : 'i-lucide-inbox'
}

export function formatMessageTime(value: number) {
  const date = new Date(value)
  const diffMs = Date.now() - date.getTime()
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (!Number.isFinite(date.getTime())) return String(value)
  if (diffMs < minute) return 'just now'
  if (diffMs < hour) return `${Math.floor(diffMs / minute)}m ago`
  if (diffMs < day) return `${Math.floor(diffMs / hour)}h ago`

  return `${Math.floor(diffMs / day)}d ago`
}

export function normalizeInboxMessage(message: {
  id: string
  source: string
  status: string
  kind: string
  senderName: string
  senderEmail: string
  subject: string
  preview: string
  bodyText: string
  senderCompany?: string | null
  senderWebsite?: string | null
  createdAt: number
}): InboxMessage {
  const source = message.source.toLowerCase() as InboxSource

  return {
    id: message.id,
    source,
    senderName: message.senderName,
    senderEmail: message.senderEmail,
    subject: message.subject,
    preview: message.preview,
    bodyText: message.bodyText,
    kind: message.kind.toLowerCase() as InboxKind,
    status: message.status.toLowerCase() as InboxStatus,
    time: formatMessageTime(message.createdAt),
    senderCompany: message.senderCompany,
    senderWebsite: message.senderWebsite,
    createdAt: message.createdAt
  }
}

export function matchesActiveFilter(
  message: InboxMessage,
  activeFilter: 'all' | 'needs_reply' | 'lead' | 'replied' | 'archived' | 'spam'
) {
  if (activeFilter === 'all') return true

  if (activeFilter === 'needs_reply') {
    return ['new', 'open'].includes(message.status)
  }

  if (activeFilter === 'lead') {
    return ['lead', 'collaboration'].includes(message.kind)
  }

  return message.status === activeFilter || message.kind === activeFilter
}
