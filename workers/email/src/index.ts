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
  ADMIN_NOTIFICATION_QUEUE?: Queue<AdminNotificationJob>
  BACKUP_FORWARD_EMAIL?: string
}

type ParsedInboundEmail = {
  senderName: string
  senderEmail: string
  subject: string
  bodyText: string
  bodyHtml: string | null
  rawMessageId: string | null
  inReplyTo: string | null
}

function createId() {
  return crypto.randomUUID()
}

function normalizeEmail(value?: string | null) {
  return (value || 'unknown@mohetios.dev').trim().toLowerCase()
}

function normalizeSubject(value?: string | null) {
  return (value || 'No subject').trim() || 'No subject'
}

function normalizeThreadSubject(subject: string) {
  return normalizeSubject(subject)
    .replace(/^(\s*(re|fw|fwd):\s*)+/i, '')
    .trim()
    .toLowerCase()
}

function createThreadKey(senderEmail: string, subject: string, messageId?: string | null) {
  if (messageId) return `message:${messageId}`

  return `${normalizeEmail(senderEmail)}:${normalizeThreadSubject(subject)}`
}

async function parseEmail(message: ForwardableEmailMessage): Promise<ParsedInboundEmail> {
  const raw = await new Response(message.raw).arrayBuffer()

  try {
    const parsed = await PostalMime.parse(raw)
    const headers = parsed.headers || []

    const getHeader = (name: string) => {
      const header = headers.find((item) => item.key.toLowerCase() === name.toLowerCase())

      return header?.value || message.headers.get(name) || null
    }

    const senderEmail = normalizeEmail(parsed.from?.address || message.from)
    const subject = normalizeSubject(parsed.subject || message.headers.get('subject'))

    return {
      senderName: parsed.from?.name || senderEmail,
      senderEmail,
      subject,
      bodyText: parsed.text?.trim() || '(No plain text body)',
      bodyHtml: parsed.html || null,
      rawMessageId: getHeader('message-id'),
      inReplyTo: getHeader('in-reply-to')
    }
  } catch (error) {
    console.error('Email parsing failed', error)

    const senderEmail = normalizeEmail(message.from)

    return {
      senderName: senderEmail,
      senderEmail,
      subject: normalizeSubject(message.headers.get('subject')),
      bodyText: '(Email parsing failed)',
      bodyHtml: null,
      rawMessageId: message.headers.get('message-id'),
      inReplyTo: message.headers.get('in-reply-to')
    }
  }
}

async function saveInboundEmail(message: ForwardableEmailMessage, env: Env) {
  const parsed = await parseEmail(message)
  const inboxMessageId = createId()
  const notificationId = createId()
  const now = Date.now()

  console.log('Inbound email received', {
    from: parsed.senderEmail,
    subject: parsed.subject,
    messageId: parsed.rawMessageId
  })

  await env.DB.prepare(
    `INSERT INTO inbox_messages (
      id,
      source,
      status,
      kind,
      priority,
      sender_name,
      sender_email,
      subject,
      body_text,
      body_html,
      raw_message_id,
      in_reply_to,
      thread_key,
      created_at,
      updated_at,
      last_activity_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      inboxMessageId,
      'EMAIL',
      'NEW',
      'OTHER',
      'NORMAL',
      parsed.senderName,
      parsed.senderEmail,
      parsed.subject,
      parsed.bodyText,
      parsed.bodyHtml,
      parsed.rawMessageId,
      parsed.inReplyTo,
      createThreadKey(parsed.senderEmail, parsed.subject, parsed.inReplyTo || parsed.rawMessageId),
      now,
      now,
      now
    )
    .run()

  await env.DB.prepare(
    `INSERT INTO admin_notifications (
      id,
      type,
      title,
      body,
      url,
      entity_type,
      entity_id,
      created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      notificationId,
      'NEW_INBOUND_EMAIL',
      'New inbound email',
      `New email from ${parsed.senderName}`,
      `/dashboard/inbox/${inboxMessageId}`,
      'inboxMessage',
      inboxMessageId,
      now
    )
    .run()

  if (env.ADMIN_NOTIFICATION_QUEUE) {
    await env.ADMIN_NOTIFICATION_QUEUE.send({
      type: 'NEW_INBOUND_EMAIL',
      inboxMessageId,
      notificationId
    })
  } else {
    console.warn('ADMIN_NOTIFICATION_QUEUE binding is missing')
  }

  return {
    inboxMessageId,
    notificationId
  }
}

export default {
  async email(message: ForwardableEmailMessage, env: Env, ctx: ExecutionContext) {
    try {
      const result = await saveInboundEmail(message, env)

      console.log('Inbound email saved', result)

      if (env.BACKUP_FORWARD_EMAIL) {
        ctx.waitUntil(message.forward(env.BACKUP_FORWARD_EMAIL))
      }
    } catch (error) {
      console.error('Email worker failed', error)

      if (env.BACKUP_FORWARD_EMAIL) {
        ctx.waitUntil(message.forward(env.BACKUP_FORWARD_EMAIL))
      }

      throw error
    }
  }
}
