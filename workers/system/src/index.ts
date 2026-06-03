import { buildPushPayload } from '@block65/webcrypto-web-push'
import { EmailMessage } from 'cloudflare:email'
import { createMimeMessage } from 'mimetext'
import type { D1Database, MessageBatch } from '@cloudflare/workers-types'

import type { EmailDeliveryJob } from '../../../shared/contracts/email'
import type {
  AdminNotificationJob,
  AdminPushPayload
} from '../../../shared/contracts/notifications'

type Env = {
  DB: D1Database

  EMAIL: {
    send(message: EmailMessage): Promise<unknown>
  }

  VAPID_PUBLIC_KEY: string
  VAPID_PRIVATE_KEY: string
  VAPID_SUBJECT: string

  MAIL_FROM?: string
  MAIL_FROM_NAME?: string
}

type WorkerJob = AdminNotificationJob | EmailDeliveryJob

type NotificationRow = {
  id: string
  type: AdminNotificationJob['type']
  title: string
  body: string
  url: string | null
  entity_id: string
}

type PushSubscriptionRow = {
  id: string
  endpoint: string
  p256dh: string
  auth: string
}

type InboxReplyRow = {
  id: string
  inbox_message_id: string
  from_email: string
  to_email: string
  subject: string
  body_text: string
  status: string
}

type InboxMessageRow = {
  id: string
  sender_email: string
  subject: string
}

function getMailFrom(env: Env) {
  return env.MAIL_FROM || 'hi@mohetios.dev'
}

function getMailFromName(env: Env) {
  return env.MAIL_FROM_NAME || 'Mohetios.dev'
}

async function sendPush(env: Env, subscription: PushSubscriptionRow, payload: AdminPushPayload) {
  const request = await buildPushPayload(
    {
      data: JSON.stringify(payload),
      options: {
        ttl: 60
      }
    },
    {
      endpoint: subscription.endpoint,
      expirationTime: null,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth
      }
    },
    {
      subject: env.VAPID_SUBJECT,
      publicKey: env.VAPID_PUBLIC_KEY,
      privateKey: env.VAPID_PRIVATE_KEY
    }
  )

  return fetch(subscription.endpoint, request as RequestInit)
}

async function disableSubscription(env: Env, subscriptionId: string) {
  await env.DB.prepare(
    `UPDATE push_subscriptions SET disabled_at = ? WHERE id = ?`
  )
    .bind(Date.now(), subscriptionId)
    .run()
}

async function markSubscriptionUsed(env: Env, subscriptionId: string) {
  await env.DB.prepare(
    `UPDATE push_subscriptions SET last_used_at = ? WHERE id = ?`
  )
    .bind(Date.now(), subscriptionId)
    .run()
}

async function handleAdminNotification(job: AdminNotificationJob, env: Env) {
  const notification = await env.DB.prepare(
    `SELECT id, type, title, body, url, entity_id
     FROM admin_notifications
     WHERE id = ?`
  )
    .bind(job.notificationId)
    .first<NotificationRow>()

  if (!notification) {
    console.warn('Notification not found', job)
    return
  }

  const subscriptions = await env.DB.prepare(
    `SELECT push_subscriptions.id,
            push_subscriptions.endpoint,
            push_subscriptions.p256dh,
            push_subscriptions.auth
     FROM push_subscriptions
     INNER JOIN users ON users.id = push_subscriptions.user_id
     WHERE users.role = 'OWNER'
       AND push_subscriptions.disabled_at IS NULL`
  ).all<PushSubscriptionRow>()

  const payload: AdminPushPayload = {
    type: notification.type,
    title: notification.title,
    body: notification.body,
    url: notification.url || '/dashboard/inbox',
    notificationId: notification.id,
    entityId: notification.entity_id
  }

  console.log('Sending admin push notification', {
    notificationId: notification.id,
    subscriptions: subscriptions.results.length
  })

  await Promise.allSettled(
    subscriptions.results.map(async (subscription) => {
      try {
        const response = await sendPush(env, subscription, payload)

        if (response.status === 404 || response.status === 410) {
          await disableSubscription(env, subscription.id)
          return
        }

        if (!response.ok) {
          console.warn('Push failed', {
            subscriptionId: subscription.id,
            status: response.status,
            body: await response.text().catch(() => '')
          })
          return
        }

        await markSubscriptionUsed(env, subscription.id)
      } catch (error) {
        console.error('Push delivery failed', {
          subscriptionId: subscription.id,
          error
        })
      }
    })
  )
}

async function sendEmail(env: Env, input: {
  fromEmail: string
  fromName: string
  toEmail: string
  subject: string
  text: string
  replyTo?: string | null
}) {
  const msg = createMimeMessage()

  msg.setSender({
    name: input.fromName,
    addr: input.fromEmail
  })

  msg.setRecipient(input.toEmail)
  msg.setSubject(input.subject)

  if (input.replyTo) {
    msg.setHeader('Reply-To', input.replyTo)
  }

  msg.addMessage({
    contentType: 'text/plain',
    data: input.text
  })

  const email = new EmailMessage(
    input.fromEmail,
    input.toEmail,
    msg.asRaw()
  )

  await env.EMAIL.send(email)
}

async function handleEmailDelivery(job: EmailDeliveryJob, env: Env) {
  if (job.type !== 'SEND_INBOX_REPLY') return

  const reply = await env.DB.prepare(
    `SELECT id,
            inbox_message_id,
            from_email,
            to_email,
            subject,
            body_text,
            status
     FROM inbox_replies
     WHERE id = ?`
  )
    .bind(job.replyId)
    .first<InboxReplyRow>()

  if (!reply) {
    console.warn('Inbox reply not found', job)
    return
  }

  if (reply.status === 'SENT') {
    return
  }

  const message = await env.DB.prepare(
    `SELECT id, sender_email, subject
     FROM inbox_messages
     WHERE id = ?`
  )
    .bind(job.inboxMessageId)
    .first<InboxMessageRow>()

  if (!message) {
    console.warn('Inbox message not found for reply', job)
    return
  }

  try {
    await sendEmail(env, {
      fromEmail: getMailFrom(env),
      fromName: getMailFromName(env),
      toEmail: reply.to_email,
      subject: reply.subject,
      text: reply.body_text,
      replyTo: getMailFrom(env)
    })

    const now = Date.now()

    await env.DB.prepare(
      `UPDATE inbox_replies
       SET status = 'SENT',
           sent_at = ?,
           error = NULL
       WHERE id = ?`
    )
      .bind(now, reply.id)
      .run()

    await env.DB.prepare(
      `UPDATE inbox_messages
       SET status = 'REPLIED',
           updated_at = ?,
           last_activity_at = ?
       WHERE id = ?`
    )
      .bind(now, now, message.id)
      .run()
  } catch (error) {
    console.error('Email delivery failed', {
      replyId: reply.id,
      error
    })

    await env.DB.prepare(
      `UPDATE inbox_replies
       SET status = 'FAILED',
           error = ?
       WHERE id = ?`
    )
      .bind(error instanceof Error ? error.message : 'Email send failed', reply.id)
      .run()

    throw error
  }
}

async function handleJob(job: WorkerJob, env: Env) {
  if (job.type === 'NEW_CONTACT_MESSAGE' || job.type === 'NEW_INBOUND_EMAIL') {
    await handleAdminNotification(job, env)
    return
  }

  if (job.type === 'SEND_INBOX_REPLY') {
    await handleEmailDelivery(job, env)
  }
}

export default {
  async queue(batch: MessageBatch<WorkerJob>, env: Env) {
    await Promise.allSettled(
      batch.messages.map(async (message) => {
        await handleJob(message.body, env)
        message.ack()
      })
    )
  }
}