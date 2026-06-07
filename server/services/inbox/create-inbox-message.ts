import { inboxMessages } from '../../models/schema'
import type { AppDb } from '../../models/client'
import { createId } from '../../utils/id'
import { createThreadKey } from '../email/normalize-email'

export async function createInboxMessage(
  db: AppDb,
  input: {
    source: 'CONTACT_FORM' | 'EMAIL'
    senderName: string
    senderEmail: string
    subject: string
    bodyText: string
    bodyHtml?: string | null
    senderCompany?: string | null
    senderWebsite?: string | null
    rawMessageId?: string | null
    inReplyTo?: string | null
    kind?: 'LEAD' | 'COLLABORATION' | 'PERSONAL' | 'SUPPORT' | 'OTHER' | 'SPAM'
    priority?: 'LOW' | 'NORMAL' | 'HIGH'
  }
) {
  const now = Date.now()
  const [message] = await db
    .insert(inboxMessages)
    .values({
      id: createId(),
      source: input.source,
      status: 'NEW',
      kind: input.kind || 'OTHER',
      priority: input.priority || 'NORMAL',
      senderName: input.senderName,
      senderEmail: input.senderEmail,
      senderCompany: input.senderCompany || null,
      senderWebsite: input.senderWebsite || null,
      subject: input.subject,
      bodyText: input.bodyText,
      bodyHtml: input.bodyHtml || null,
      rawMessageId: input.rawMessageId || null,
      inReplyTo: input.inReplyTo || null,
      threadKey: createThreadKey(
        input.senderEmail,
        input.subject,
        input.inReplyTo || input.rawMessageId
      ),
      createdAt: now,
      updatedAt: now,
      lastActivityAt: now,
      leadStatus: input.kind === 'LEAD' ? 'NEW' : null
    })
    .returning()

  if (!message) {
    throw new Error('Inbox message could not be created')
  }

  return message
}
