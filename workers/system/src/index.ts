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
import {
  getNewsletterWelcomeContent,
  renderNewsletterEmail,
  toNewsletterLocale,
  type NewsletterIssueContent
} from '../../../shared/utils/newsletter-email'
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
  NUXT_PUBLIC_SITE_URL?: string
}

type WorkerJob = AdminNotificationJob | EmailDeliveryJob

// Must match `triggers.crons` in wrangler.jsonc; every other cron runs the newsletter tick.
const INBOX_REMINDER_CRON = '0 */12 * * *'

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
  locale: string | null
  unsubscribe_token: string | null
  last_email_sent_at: number | null
}

type NewsletterIssueRow = {
  id: string
  template: NewsletterIssueContent['template']
  locale: string
  subject: string
  preheader: string | null
  heading: string
  intro: string
  items: string
  cta_label: string | null
  cta_url: string | null
  outro: string
  scheduled_at: number | null
}

type NewsletterDeliveryRow = {
  issue_id: string
  subscriber_id: string
  email: string
  subscriber_status: string
  locale: string | null
  unsubscribe_token: string | null
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

function getSiteUrl(env: Env) {
  return (readString(env.NUXT_PUBLIC_SITE_URL) || 'https://mohetios.ir').replace(/\/$/, '')
}

function getUnsubscribeUrl(env: Env, token: string | null, locale: string | null) {
  return `${getSiteUrl(env)}/api/newsletter/unsubscribe?token=${token ?? ''}&lang=${toNewsletterLocale(locale)}`
}

// List-Unsubscribe + one-click POST (RFC 8058) is what Gmail/Yahoo expect from bulk senders.
function getUnsubscribeHeaders(unsubscribeUrl: string) {
  return {
    'List-Unsubscribe': `<${unsubscribeUrl}>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
  }
}

// mimetext writes bodies as-is; base64 keeps UTF-8 (Persian, em dashes) intact in transit.
function toBase64Body(value: string) {
  let binary = ''

  for (const byte of new TextEncoder().encode(value)) {
    binary += String.fromCharCode(byte)
  }

  return btoa(binary).replace(/.{76}(?=.)/g, '$&\r\n')
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
    headers?: Record<string, string>
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

  for (const [name, value] of Object.entries(input.headers ?? {})) {
    msg.setHeader(name, value)
  }

  msg.addMessage({
    contentType: 'text/plain',
    encoding: 'base64',
    data: toBase64Body(input.text)
  })

  if (input.html) {
    msg.addMessage({
      contentType: 'text/html',
      encoding: 'base64',
      data: toBase64Body(input.html)
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

async function handleNewsletterWelcome(
  job: Extract<EmailDeliveryJob, { type: 'SEND_NEWSLETTER_WELCOME' }>,
  env: Env
) {
  const subscriber = await env.DB.prepare(
    `SELECT id, email, status, locale, unsubscribe_token, last_email_sent_at
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

  const content = getNewsletterWelcomeContent(subscriber.locale)
  const unsubscribeUrl = getUnsubscribeUrl(env, subscriber.unsubscribe_token, subscriber.locale)
  const { text, html } = renderNewsletterEmail(content, {
    siteUrl: getSiteUrl(env),
    unsubscribeUrl
  })

  try {
    await sendEmail(env, {
      fromEmail: getMailFrom(env),
      fromName: getMailFromName(env),
      toEmail: subscriber.email,
      subject: content.subject,
      text,
      html,
      headers: getUnsubscribeHeaders(unsubscribeUrl)
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

// ponytail: 50 emails per 5-minute tick (~600/hour) and no retry for failed rows;
// raise the batch or add a retry pass when the list or failure rate outgrows it.
const NEWSLETTER_BATCH_SIZE = 50
const UNSUBSCRIBE_PLACEHOLDER = '%%UNSUBSCRIBE_URL%%'

function toIssueContent(row: NewsletterIssueRow): NewsletterIssueContent {
  return {
    template: row.template,
    locale: toNewsletterLocale(row.locale),
    subject: row.subject,
    preheader: row.preheader,
    heading: row.heading,
    intro: row.intro,
    items: JSON.parse(row.items),
    ctaLabel: row.cta_label,
    ctaUrl: row.cta_url,
    outro: row.outro
  }
}

async function getNewsletterIssue(env: Env, issueId: string) {
  return env.DB.prepare(
    `SELECT id, template, locale, subject, preheader, heading, intro, items,
            cta_label, cta_url, outro, scheduled_at
     FROM newsletter_issues
     WHERE id = ?`
  )
    .bind(issueId)
    .first<NewsletterIssueRow>()
}

async function handleNewsletterTest(
  job: Extract<EmailDeliveryJob, { type: 'SEND_NEWSLETTER_TEST' }>,
  env: Env
) {
  const issue = await getNewsletterIssue(env, job.issueId)

  if (!issue) {
    console.warn('Newsletter issue not found for test', job)
    return
  }

  const content = toIssueContent(issue)
  const { text, html } = renderNewsletterEmail(content, {
    siteUrl: getSiteUrl(env),
    unsubscribeUrl: getUnsubscribeUrl(env, null, content.locale),
    date: issue.scheduled_at ?? undefined
  })

  await sendEmail(env, {
    fromEmail: getMailFrom(env),
    fromName: getMailFromName(env),
    toEmail: job.toEmail,
    subject: `[Test] ${content.subject}`,
    text,
    html
  })
}

// Snapshot the audience into delivery rows. One D1 batch runs as one transaction and the
// insert only matches while the issue is still SCHEDULED, so overlapping ticks can't double it.
async function dispatchDueNewsletterIssues(env: Env, now: number) {
  const due = await env.DB.prepare(
    `SELECT id, locale FROM newsletter_issues
     WHERE status = 'SCHEDULED' AND scheduled_at <= ?
     ORDER BY scheduled_at
     LIMIT 5`
  )
    .bind(now)
    .all<{ id: string; locale: string }>()

  for (const issue of due.results) {
    await env.DB.batch([
      env.DB.prepare(
        `INSERT OR IGNORE INTO newsletter_deliveries (issue_id, subscriber_id, status, created_at)
         SELECT ?, id, 'QUEUED', ?
         FROM newsletter_subscribers
         WHERE status = 'subscribed'
           AND coalesce(locale, ?) = ?
           AND EXISTS (SELECT 1 FROM newsletter_issues WHERE id = ? AND status = 'SCHEDULED')`
      ).bind(issue.id, now, toNewsletterLocale(null), issue.locale, issue.id),
      env.DB.prepare(
        `UPDATE newsletter_issues
         SET status = 'SENDING',
             recipient_count = (SELECT count(*) FROM newsletter_deliveries WHERE issue_id = ?),
             updated_at = ?
         WHERE id = ? AND status = 'SCHEDULED'`
      ).bind(issue.id, now, issue.id)
    ])
  }
}

async function sendNewsletterBatch(env: Env, now: number) {
  const deliveries = await env.DB.prepare(
    `SELECT d.issue_id, d.subscriber_id, s.email, s.status AS subscriber_status,
            s.locale, s.unsubscribe_token
     FROM newsletter_deliveries d
     INNER JOIN newsletter_subscribers s ON s.id = d.subscriber_id
     WHERE d.status = 'QUEUED'
     LIMIT ?`
  )
    .bind(NEWSLETTER_BATCH_SIZE)
    .all<NewsletterDeliveryRow>()

  if (!deliveries.results.length) return

  // Render each issue once, then swap in the per-subscriber unsubscribe link.
  const rendered = new Map<string, { subject: string; text: string; html: string } | null>()

  for (const issueId of new Set(deliveries.results.map((row) => row.issue_id))) {
    const issue = await getNewsletterIssue(env, issueId)
    const content = issue ? toIssueContent(issue) : null

    rendered.set(
      issueId,
      issue && content
        ? {
            subject: content.subject,
            ...renderNewsletterEmail(content, {
              siteUrl: getSiteUrl(env),
              unsubscribeUrl: UNSUBSCRIBE_PLACEHOLDER,
              date: issue.scheduled_at ?? now
            })
          }
        : null
    )
  }

  const results = await Promise.allSettled(
    deliveries.results.map(async (row) => {
      const email = rendered.get(row.issue_id)

      if (!email || row.subscriber_status !== 'subscribed') return 'SKIPPED' as const

      const unsubscribeUrl = getUnsubscribeUrl(env, row.unsubscribe_token, row.locale)

      await sendEmail(env, {
        fromEmail: getMailFrom(env),
        fromName: getMailFromName(env),
        toEmail: row.email,
        subject: email.subject,
        text: email.text.replaceAll(UNSUBSCRIBE_PLACEHOLDER, unsubscribeUrl),
        html: email.html.replaceAll(UNSUBSCRIBE_PLACEHOLDER, unsubscribeUrl),
        headers: getUnsubscribeHeaders(unsubscribeUrl)
      })

      return 'SENT' as const
    })
  )

  const sentAt = Date.now()

  await env.DB.batch(
    deliveries.results.flatMap((row, index) => {
      const result = results[index]!
      const status = result.status === 'fulfilled' ? result.value : 'FAILED'
      const error =
        result.status === 'rejected'
          ? String(result.reason instanceof Error ? result.reason.message : result.reason).slice(
              0,
              500
            )
          : null

      const update = env.DB.prepare(
        `UPDATE newsletter_deliveries SET status = ?, error = ?, sent_at = ?
         WHERE issue_id = ? AND subscriber_id = ?`
      ).bind(status, error, status === 'SENT' ? sentAt : null, row.issue_id, row.subscriber_id)

      return status === 'SENT'
        ? [
            update,
            env.DB.prepare(
              `UPDATE newsletter_subscribers SET last_email_sent_at = ? WHERE id = ?`
            ).bind(sentAt, row.subscriber_id)
          ]
        : [update]
    })
  )
}

async function finishSentNewsletterIssues(env: Env, now: number) {
  await env.DB.prepare(
    `UPDATE newsletter_issues
     SET status = 'SENT', sent_at = ?, updated_at = ?
     WHERE status = 'SENDING'
       AND NOT EXISTS (
         SELECT 1 FROM newsletter_deliveries
         WHERE issue_id = newsletter_issues.id AND status = 'QUEUED'
       )`
  )
    .bind(now, now)
    .run()
}

async function runNewsletterTick(env: Env) {
  const now = Date.now()

  await dispatchDueNewsletterIssues(env, now)
  await sendNewsletterBatch(env, now)
  await finishSentNewsletterIssues(env, Date.now())
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

  if (job.type === 'SEND_NEWSLETTER_TEST') {
    await handleNewsletterTest(job, env)
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
    return
  }

  console.warn('Unhandled queue job', { type: (job as { type?: string }).type })
}

export default {
  async scheduled(controller: ScheduledController, env: Env, _ctx: ExecutionContext) {
    if (controller.cron === INBOX_REMINDER_CRON) {
      await sendUnreadInboxReminder(env)
      return
    }

    await runNewsletterTick(env)
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
