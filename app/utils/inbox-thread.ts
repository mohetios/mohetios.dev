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
  bodyHtml?: string | null
  kind: InboxKind
  status: InboxStatus
  priority?: 'low' | 'normal' | 'high'
  time: string
  senderCompany?: string | null
  senderWebsite?: string | null
  createdAt: number
  updatedAt?: number
  lastActivityAt?: number
}

export type InboxThreadStatus =
  | 'new'
  | 'open'
  | 'needs_reply'
  | 'replied'
  | 'archived'
  | 'spam'

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
