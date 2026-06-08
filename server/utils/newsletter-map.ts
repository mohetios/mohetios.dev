import type { NewsletterSubscriber } from '../models/schema'

export type NewsletterSubscriberStatus =
  | 'PENDING'
  | 'SUBSCRIBED'
  | 'UNSUBSCRIBED'
  | 'BOUNCED'
  | 'COMPLAINED'

const statusToGraphql: Record<NewsletterSubscriber['status'], NewsletterSubscriberStatus> = {
  pending: 'PENDING',
  subscribed: 'SUBSCRIBED',
  unsubscribed: 'UNSUBSCRIBED',
  bounced: 'BOUNCED',
  complained: 'COMPLAINED'
}

export function normalizeNewsletterStatus(
  status: NewsletterSubscriber['status']
): NewsletterSubscriberStatus {
  return statusToGraphql[status]
}

export function normalizeNewsletterSubscriberRow(row: NewsletterSubscriber) {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    status: normalizeNewsletterStatus(row.status),
    source: row.source,
    locale: row.locale,
    consentText: row.consentText,
    consentVersion: row.consentVersion,
    consentAt: row.consentAt,
    confirmedAt: row.confirmedAt,
    unsubscribedAt: row.unsubscribedAt,
    lastEmailSentAt: row.lastEmailSentAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  }
}
