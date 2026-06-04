import type { InboxMessageDto, InboxThreadEventDto } from '~/composables/useInboxWorkspace'
import type { InboxMessage, InboxThreadEvent } from '~/utils/inbox-thread'
import { formatMessageTime } from '~/utils/inbox-thread'

function lower<T extends string>(value: T) {
  return value.toLowerCase()
}

function mapThreadEventType(type: string): InboxThreadEvent['type'] {
  if (type === 'inbound_message') return 'inbound'
  if (type === 'outbound_reply') return 'outbound_reply'
  if (type === 'internal_note') return 'internal_note'
  if (type === 'ai_draft') return 'ai_draft'
  if (type === 'status_change') return 'status_change'

  return 'inbound'
}

function mapDeliveryStatus(
  status: string
): InboxThreadEvent['deliveryStatus'] | undefined {
  if (status === 'sent') return 'sent'
  if (status === 'failed') return 'failed'
  if (status === 'draft') return 'draft'
  if (status === 'queued') return 'draft'
  if (status === 'received') return 'not_applicable'
  if (status === 'not_applicable') return 'not_applicable'

  return undefined
}

export function normalizeInboxDto(message: InboxMessageDto): InboxMessage {
  return {
    id: message.id,
    source: lower(message.source) as InboxMessage['source'],
    status: lower(message.status) as InboxMessage['status'],
    kind: lower(message.kind) as InboxMessage['kind'],
    priority: lower(message.priority) as InboxMessage['priority'],
    senderName: message.senderName,
    senderEmail: message.senderEmail,
    senderCompany: message.senderCompany,
    senderWebsite: message.senderWebsite,
    subject: message.subject,
    preview: message.preview,
    bodyText: message.bodyText,
    bodyHtml: message.bodyHtml,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
    lastActivityAt: message.lastActivityAt,
    time: formatMessageTime(message.createdAt)
  }
}

export function normalizeThreadEventDto(event: InboxThreadEventDto): InboxThreadEvent {
  return {
    id: event.id,
    type: mapThreadEventType(event.type),
    authorName: event.authorName,
    authorEmail: event.authorEmail || undefined,
    bodyText: event.bodyText,
    time: new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(event.createdAt)),
    createdAt: event.createdAt,
    isPrivate: event.isPrivate,
    deliveryStatus: mapDeliveryStatus(event.deliveryStatus)
  }
}
