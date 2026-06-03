import type { NormalizedEmail } from '../../../shared/contracts/email'

export function normalizeEmailAddress(value: string) {
  return value.trim().toLowerCase()
}

export function normalizeSubject(value: string | null | undefined) {
  return (value || 'No subject').replace(/^(\s*(re|fw|fwd):\s*)+/i, '').trim() || 'No subject'
}

export function createThreadKey(senderEmail: string, subject: string, messageId?: string | null) {
  const normalizedSender = normalizeEmailAddress(senderEmail)
  const normalizedSubject = normalizeSubject(subject).toLowerCase()

  return messageId ? `message:${messageId}` : `${normalizedSender}:${normalizedSubject}`
}

export function normalizeParsedEmail(input: {
  senderName?: string | null
  senderEmail?: string | null
  subject?: string | null
  bodyText?: string | null
  bodyHtml?: string | null
  rawMessageId?: string | null
  inReplyTo?: string | null
}): NormalizedEmail {
  const senderEmail = normalizeEmailAddress(input.senderEmail || 'unknown@mohetios.dev')
  const subject = input.subject?.trim() || 'No subject'

  return {
    senderName: input.senderName?.trim() || senderEmail,
    senderEmail,
    subject,
    bodyText: input.bodyText?.trim() || '(No plain text body)',
    bodyHtml: input.bodyHtml || null,
    rawMessageId: input.rawMessageId || null,
    inReplyTo: input.inReplyTo || null,
    threadKey: createThreadKey(senderEmail, subject, input.inReplyTo || input.rawMessageId)
  }
}
