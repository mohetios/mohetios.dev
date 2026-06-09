import { buildPushPayload } from '@block65/webcrypto-web-push'
import { EmailMessage } from 'cloudflare:email'
import { createMimeMessage } from 'mimetext'
import type {
  D1Database,
  ExecutionContext,
  MessageBatch,
  ScheduledController
} from '@cloudflare/workers-types'

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

  NUXT_VAPID_PUBLIC_KEY?: string
  NUXT_VAPID_PRIVATE_KEY?: string
  NUXT_VAPID_SUBJECT?: string

  NUXT_MAIL_FROM?: string
  NUXT_MAIL_FROM_NAME?: string
}

type WorkerJob = AdminNotificationJob | EmailDeliveryJob

type NotificationRow = {
  id: string
  type: AdminNotificationJob['type'] | 'NEW_COMMENT' | 'UNREAD_INBOX_REMINDER'
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

type NewsletterSubscriberRow = {
  id: string
  email: string
  status: string
  last_email_sent_at: number | null
}

type CommentRow = {
  id: string
  author_email: string
  target_title: string
  status: string
}

type UnreadInboxReminderRow = {
  id: string
  sender_name: string
  subject: string
  unread_count: number
}

function readString(...values: Array<string | null | undefined>) {
  for (const value of values) {
    const normalized = value?.trim()

    if (normalized) return normalized
  }

  return ''
}

function getMailFrom(env: Env) {
  return readString(env.NUXT_MAIL_FROM) || 'hi@mohetios.dev'
}

function getMailFromName(env: Env) {
  return readString(env.NUXT_MAIL_FROM_NAME) || 'Mohetios.dev'
}

function getVapidConfig(env: Env) {
  return {
    subject: readString(env.NUXT_VAPID_SUBJECT) || 'mailto:hi@mohetios.dev',
    publicKey: readString(env.NUXT_VAPID_PUBLIC_KEY),
    privateKey: readString(env.NUXT_VAPID_PRIVATE_KEY)
  }
}

function isValidEmailAddress(value?: string | null) {
  if (!value) return false

  const email = value.trim()

  if (!email) return false
  if (email.startsWith('mailto:')) return false
  if (email.includes('\n') || email.includes('\r')) return false

  return /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)
}

async function sendPush(env: Env, subscription: PushSubscriptionRow, payload: AdminPushPayload) {
  const vapid = getVapidConfig(env)

  if (!vapid.publicKey || !vapid.privateKey || !vapid.subject) {
    throw new Error('VAPID configuration is missing')
  }

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
      subject: vapid.subject,
      publicKey: vapid.publicKey,
      privateKey: vapid.privateKey
    }
  )

  return fetch(subscription.endpoint, request as RequestInit)
}

async function disableSubscription(env: Env, subscriptionId: string) {
  await env.DB.prepare(`UPDATE push_subscriptions SET disabled_at = ? WHERE id = ?`)
    .bind(Date.now(), subscriptionId)
    .run()
}

async function markSubscriptionUsed(env: Env, subscriptionId: string) {
  await env.DB.prepare(`UPDATE push_subscriptions SET last_used_at = ? WHERE id = ?`)
    .bind(Date.now(), subscriptionId)
    .run()
}

async function getOwnerPushSubscriptions(env: Env) {
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

  return subscriptions.results
}

async function sendPushToOwnerSubscriptions(env: Env, payload: AdminPushPayload) {
  const subscriptions = await getOwnerPushSubscriptions(env)

  await Promise.allSettled(
    subscriptions.map(async (subscription) => {
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

  return subscriptions.length
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

  const payload: AdminPushPayload = {
    type: notification.type,
    title: notification.title,
    body: notification.body,
    url: notification.url || '/dashboard/inbox',
    notificationId: notification.id,
    entityId: notification.entity_id
  }

  const subscriptionCount = await sendPushToOwnerSubscriptions(env, payload)

  console.log('Sent admin push notification', {
    notificationId: notification.id,
    subscriptions: subscriptionCount
  })
}

async function sendUnreadInboxReminder(env: Env) {
  const reminder = await env.DB.prepare(
    `SELECT id,
            sender_name,
            subject,
            (SELECT count(*) FROM inbox_messages WHERE status = 'NEW') AS unread_count
     FROM inbox_messages
     WHERE status = 'NEW'
     ORDER BY created_at DESC
     LIMIT 1`
  ).first<UnreadInboxReminderRow>()

  if (!reminder || reminder.unread_count < 1) {
    return
  }

  const count = Number(reminder.unread_count)
  const messageWord = count === 1 ? 'message' : 'messages'
  const payload: AdminPushPayload = {
    type: 'UNREAD_INBOX_REMINDER',
    title: `You have ${count} unread ${messageWord}`,
    body:
      count === 1
        ? `${reminder.sender_name}: ${reminder.subject}`
        : 'Open the dashboard inbox to review them.',
    url: `/dashboard/inbox?message=${reminder.id}`,
    notificationId: 'unread-inbox-reminder',
    entityId: reminder.id
  }

  const subscriptionCount = await sendPushToOwnerSubscriptions(env, payload)

  console.log('Sent unread inbox reminder', {
    unread: count,
    subscriptions: subscriptionCount
  })
}

async function sendEmail(
  env: Env,
  input: {
    fromEmail: string
    fromName: string
    toEmail: string
    subject: string
    text: string
    html?: string
  }
) {
  const fromEmail = input.fromEmail.trim()
  const toEmail = input.toEmail.trim()

  if (!isValidEmailAddress(fromEmail)) {
    throw new Error(`Invalid sender email: ${fromEmail}`)
  }

  if (!isValidEmailAddress(toEmail)) {
    throw new Error(`Invalid recipient email: ${toEmail}`)
  }

  const msg = createMimeMessage()

  msg.setSender({
    name: input.fromName || 'Mohetios.dev',
    addr: fromEmail
  })

  msg.setRecipient(toEmail)
  msg.setSubject(input.subject || 'No subject')

  if (input.html) {
    msg.addMessage({
      contentType: 'text/plain',
      data: input.text
    })

    msg.addMessage({
      contentType: 'text/html',
      data: input.html
    })
  } else {
    msg.addMessage({
      contentType: 'text/plain',
      data: input.text
    })
  }

  const email = new EmailMessage(fromEmail, toEmail, msg.asRaw())

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
    await env.DB.prepare(
      `UPDATE inbox_replies
       SET status = 'QUEUED',
           error = NULL
       WHERE id = ?`
    )
      .bind(reply.id)
      .run()

    await sendEmail(env, {
      fromEmail: getMailFrom(env),
      fromName: getMailFromName(env),
      toEmail: reply.to_email,
      subject: reply.subject,
      text: reply.body_text
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

function getNewsletterWelcomeEmailContent() {
  const text = `Thanks for subscribing to Mohetios.dev.

You'll receive occasional notes about product engineering, Cloudflare-native systems, AI workflows, open-source experiments, and technical writing.

No spam. You can unsubscribe anytime.

— Ali
Mohetios.dev`

  const html = `<p>Thanks for subscribing to <strong>Mohetios.dev</strong>.</p>

<p>
You'll receive occasional notes about product engineering,
Cloudflare-native systems, AI workflows, open-source experiments,
and technical writing.
</p>

<p>No spam. You can unsubscribe anytime.</p>

<p>— Ali<br />Mohetios.dev</p>`

  return { text, html }
}

async function handleNewsletterWelcome(job: Extract<EmailDeliveryJob, { type: 'SEND_NEWSLETTER_WELCOME' }>, env: Env) {
  const subscriber = await env.DB.prepare(
    `SELECT id, email, status, last_email_sent_at
     FROM newsletter_subscribers
     WHERE id = ?`
  )
    .bind(job.subscriberId)
    .first<NewsletterSubscriberRow>()

  if (!subscriber) {
    console.warn('Newsletter subscriber not found', job)
    return
  }

  if (subscriber.status !== 'subscribed') {
    return
  }

  if (subscriber.last_email_sent_at) {
    return
  }

  const { text, html } = getNewsletterWelcomeEmailContent()

  try {
    await sendEmail(env, {
      fromEmail: getMailFrom(env),
      fromName: getMailFromName(env),
      toEmail: subscriber.email,
      subject: 'Welcome to Mohetios.dev',
      text,
      html
    })

    const now = Date.now()

    await env.DB.prepare(
      `UPDATE newsletter_subscribers
       SET last_email_sent_at = ?,
           updated_at = ?
       WHERE id = ?`
    )
      .bind(now, now, subscriber.id)
      .run()
  } catch (error) {
    console.error('Newsletter welcome email failed', {
      subscriberId: subscriber.id,
      error
    })

    throw error
  }
}

async function getCommentRow(env: Env, commentId: string) {
  return env.DB.prepare(
    `SELECT id, author_email, target_title, status
     FROM comments
     WHERE id = ?`
  )
    .bind(commentId)
    .first<CommentRow>()
}

function getCommentReceivedEmailContent(targetTitle: string) {
  const text = `Thanks for your comment on Mohetios.dev.

We received your note on "${targetTitle}". It is waiting for review. If approved, it will appear under the article.

— Mohetios.dev`

  const html = `<p>Thanks for your comment on <strong>Mohetios.dev</strong>.</p>
<p>We received your note on <strong>${targetTitle}</strong>. It is waiting for review. If approved, it will appear under the article.</p>
<p>— Mohetios.dev</p>`

  return { text, html }
}

function getCommentApprovedEmailContent(targetTitle: string) {
  const text = `Your comment on "${targetTitle}" has been approved and is now visible on Mohetios.dev.

— Mohetios.dev`

  const html = `<p>Your comment on <strong>${targetTitle}</strong> has been approved and is now visible on Mohetios.dev.</p>
<p>— Mohetios.dev</p>`

  return { text, html }
}

function getCommentSpamEmailContent(targetTitle: string) {
  const text = `Your comment on "${targetTitle}" could not be published after review.

— Mohetios.dev`

  const html = `<p>Your comment on <strong>${targetTitle}</strong> could not be published after review.</p>
<p>— Mohetios.dev</p>`

  return { text, html }
}

async function handleCommentReceivedEmail(
  job: Extract<EmailDeliveryJob, { type: 'COMMENT_RECEIVED_CONFIRMATION_EMAIL' }>,
  env: Env
) {
  const comment = await getCommentRow(env, job.commentId)

  if (!comment) {
    console.warn('Comment not found for confirmation email', job)
    return
  }

  const { text, html } = getCommentReceivedEmailContent(comment.target_title)

  await sendEmail(env, {
    fromEmail: getMailFrom(env),
    fromName: getMailFromName(env),
    toEmail: comment.author_email,
    subject: 'We received your comment on Mohetios.dev',
    text,
    html
  })
}

async function handleCommentApprovedEmail(
  job: Extract<EmailDeliveryJob, { type: 'COMMENT_APPROVED_EMAIL' }>,
  env: Env
) {
  const comment = await getCommentRow(env, job.commentId)

  if (!comment || comment.status !== 'APPROVED') {
    return
  }

  const { text, html } = getCommentApprovedEmailContent(comment.target_title)

  await sendEmail(env, {
    fromEmail: getMailFrom(env),
    fromName: getMailFromName(env),
    toEmail: comment.author_email,
    subject: 'Your comment was approved',
    text,
    html
  })
}

async function handleCommentSpamEmail(
  job: Extract<EmailDeliveryJob, { type: 'COMMENT_MARKED_SPAM_EMAIL' }>,
  env: Env
) {
  const comment = await getCommentRow(env, job.commentId)

  if (!comment || comment.status !== 'SPAM') {
    return
  }

  const { text, html } = getCommentSpamEmailContent(comment.target_title)

  await sendEmail(env, {
    fromEmail: getMailFrom(env),
    fromName: getMailFromName(env),
    toEmail: comment.author_email,
    subject: 'Your comment could not be published',
    text,
    html
  })
}

async function handleJob(job: WorkerJob, env: Env) {
  if (
    job.type === 'NEW_CONTACT_MESSAGE' ||
    job.type === 'NEW_INBOUND_EMAIL' ||
    job.type === 'NEW_COMMENT'
  ) {
    await handleAdminNotification(job, env)
    return
  }

  if (job.type === 'SEND_INBOX_REPLY') {
    await handleEmailDelivery(job, env)
    return
  }

  if (job.type === 'SEND_NEWSLETTER_WELCOME') {
    await handleNewsletterWelcome(job, env)
    return
  }

  if (job.type === 'COMMENT_RECEIVED_CONFIRMATION_EMAIL') {
    await handleCommentReceivedEmail(job, env)
    return
  }

  if (job.type === 'COMMENT_APPROVED_EMAIL') {
    await handleCommentApprovedEmail(job, env)
    return
  }

  if (job.type === 'COMMENT_MARKED_SPAM_EMAIL') {
    await handleCommentSpamEmail(job, env)
  }
}

export default {
  async scheduled(_controller: ScheduledController, env: Env, _ctx: ExecutionContext) {
    await sendUnreadInboxReminder(env)
  },

  async queue(batch: MessageBatch<WorkerJob>, env: Env) {
    await Promise.allSettled(
      batch.messages.map(async (message) => {
        try {
          await handleJob(message.body, env)
          message.ack()
        } catch (error) {
          console.error('Queue message failed', {
            body: message.body,
            error
          })

          message.retry()
        }
      })
    )
  }
}
