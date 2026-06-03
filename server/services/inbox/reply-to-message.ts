import { eq } from 'drizzle-orm'

import type { AppDb } from '../../models/client'
import { inboxMessages, inboxReplies } from '../../models/schema'
import type { ServerEnv } from '../../utils/env'
import { createId } from '../../utils/id'

export async function replyToMessage(
  db: AppDb,
  env: ServerEnv,
  input: {
    inboxMessageId: string
    bodyText: string
  }
) {
  const [message] = await db
    .select()
    .from(inboxMessages)
    .where(eq(inboxMessages.id, input.inboxMessageId))
    .limit(1)

  if (!message) {
    throw new Error('Message not found')
  }

  if (!env.EMAIL_DELIVERY_QUEUE) {
    throw new Error('EMAIL_DELIVERY_QUEUE binding is not configured')
  }

  const now = Date.now()

  const reply = {
    id: createId(),
    inboxMessageId: message.id,
    fromEmail: env.MAIL_FROM,
    toEmail: message.senderEmail,
    subject: message.subject.toLowerCase().startsWith('re:')
      ? message.subject
      : `Re: ${message.subject}`,
    bodyText: input.bodyText,
    status: 'QUEUED' as const,
    createdAt: now
  }

  const [created] = await db.insert(inboxReplies).values(reply).returning()

  if (!created) {
    throw new Error('Inbox reply could not be created')
  }

  await env.EMAIL_DELIVERY_QUEUE.send({
    type: 'SEND_INBOX_REPLY',
    replyId: created.id,
    inboxMessageId: message.id
  })

  return created
}