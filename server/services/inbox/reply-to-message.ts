import { eq } from 'drizzle-orm'

import type { AppDb } from '../../models/client'
import { inboxMessages, inboxReplies } from '../../models/schema'
import type { ServerEnv } from '../../utils/env'
import { createId } from '../../utils/id'
import { sendEmail } from '../email/send-email'
import { markMessageStatus } from './mark-message-status'

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

  const now = Date.now()
  const reply = {
    id: createId(),
    inboxMessageId: message.id,
    fromEmail: env.MAIL_FROM,
    toEmail: message.senderEmail,
    subject: message.subject.toLowerCase().startsWith('re:') ? message.subject : `Re: ${message.subject}`,
    bodyText: input.bodyText,
    status: 'DRAFT' as const,
    createdAt: now
  }
  const [created] = await db.insert(inboxReplies).values(reply).returning()

  if (!created) {
    throw new Error('Inbox reply could not be created')
  }

  try {
    const sent = await sendEmail(env, {
      to: message.senderEmail,
      subject: reply.subject,
      text: input.bodyText,
      replyTo: env.MAIL_FROM
    })
    const [updated] = await db
      .update(inboxReplies)
      .set({
        status: 'SENT',
        providerMessageId: sent.providerMessageId,
        sentAt: Date.now()
      })
      .where(eq(inboxReplies.id, created.id))
      .returning()

    if (!updated) {
      throw new Error('Inbox reply could not be updated')
    }

    await markMessageStatus(db, message.id, 'REPLIED')

    return updated
  } catch (error) {
    const [failed] = await db
      .update(inboxReplies)
      .set({
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Email send failed'
      })
      .where(eq(inboxReplies.id, created.id))
      .returning()

    if (!failed) {
      throw new Error('Inbox reply failure could not be saved')
    }

    return failed
  }
}
