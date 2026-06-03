import PostalMime from 'postal-mime'
import type {
  D1Database,
  ExecutionContext,
  ForwardableEmailMessage,
  Queue
} from '@cloudflare/workers-types'

import type { AdminNotificationJob } from '../../../shared/contracts/notifications'

type Env = {
  DB: D1Database
  ADMIN_NOTIFICATION_QUEUE: Queue<AdminNotificationJob>
  BACKUP_FORWARD_EMAIL?: string
}

function createId() {
  return crypto.randomUUID()
}

function normalizeEmail(value: string | undefined) {
  return (value || 'unknown@mohetios.dev').trim().toLowerCase()
}

function normalizeSubject(value: string | undefined) {
  return (value || 'No subject').trim() || 'No subject'
}

function createThreadKey(senderEmail: string, subject: string, messageId?: string) {
  return messageId
    ? `message:${messageId}`
    : `${normalizeEmail(senderEmail)}:${normalizeSubject(subject).replace(/^(\s*(re|fw|fwd):\s*)+/i, '').toLowerCase()}`
}

async function parseEmail(message: ForwardableEmailMessage) {
  const raw = await new Response(message.raw).arrayBuffer()

  try {
    const parsed = await PostalMime.parse(raw)
    const from = parsed.from
    const headers = parsed.headers || []
    const getHeader = (name: string) => {
      const header = headers.find((item) => item.key.toLowerCase() === name.toLowerCase())

      return header?.value
    }
    const senderEmail = normalizeEmail(from?.address || message.from)
    const subject = normalizeSubject(parsed.subject || message.headers.get('subject') || undefined)

    return {
      senderName: from?.name || senderEmail,
      senderEmail,
      subject,
      bodyText: parsed.text?.trim() || '(No plain text body)',
      bodyHtml: parsed.html || null,
      rawMessageId: getHeader('message-id') || message.headers.get('message-id'),
      inReplyTo: getHeader('in-reply-to') || message.headers.get('in-reply-to')
    }
  } catch {
    const senderEmail = normalizeEmail(message.from)

    return {
      senderName: senderEmail,
      senderEmail,
      subject: normalizeSubject(message.headers.get('subject') || undefined),
      bodyText: '(Email parsing failed)',
      bodyHtml: null,
      rawMessageId: message.headers.get('message-id'),
      inReplyTo: message.headers.get('in-reply-to')
    }
  }
}

export default {
  async email(message: ForwardableEmailMessage, env: Env, ctx: ExecutionContext) {
    const parsed = await parseEmail(message)
    const inboxMessageId = createId()
    const notificationId = createId()
    const now = Date.now()

    await env.DB.prepare(
      `INSERT INTO inbox_messages (
        id, source, status, kind, priority, sender_name, sender_email, subject, body_text,
        body_html, raw_message_id, in_reply_to, thread_key, created_at, updated_at, last_activity_at
      ) VALUES (?, 'EMAIL', 'NEW', 'OTHER', 'NORMAL', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        inboxMessageId,
        parsed.senderName,
        parsed.senderEmail,
        parsed.subject,
        parsed.bodyText,
        parsed.bodyHtml,
        parsed.rawMessageId,
        parsed.inReplyTo,
        createThreadKey(parsed.senderEmail, parsed.subject, parsed.inReplyTo || parsed.rawMessageId || undefined),
        now,
        now,
        now
      )
      .run()

    await env.DB.prepare(
      `INSERT INTO admin_notifications (
        id, type, title, body, url, entity_type, entity_id, created_at
      ) VALUES (?, 'NEW_INBOUND_EMAIL', ?, ?, ?, 'inboxMessage', ?, ?)`
    )
      .bind(
        notificationId,
        'New inbound email',
        `New email from ${parsed.senderName}`,
        `/dashboard/inbox/${inboxMessageId}`,
        inboxMessageId,
        now
      )
      .run()

    ctx.waitUntil(
      env.ADMIN_NOTIFICATION_QUEUE.send({
        type: 'NEW_INBOUND_EMAIL',
        inboxMessageId,
        notificationId
      })
    )

    if (env.BACKUP_FORWARD_EMAIL) {
      ctx.waitUntil(message.forward(env.BACKUP_FORWARD_EMAIL))
    }
  }
}
