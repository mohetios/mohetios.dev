import { buildPushPayload } from '@block65/webcrypto-web-push'
import type { D1Database, MessageBatch } from '@cloudflare/workers-types'

import type { AdminNotificationJob, AdminPushPayload } from '../shared/contracts/notifications'

type Env = {
  DB: D1Database
  NUXT_VAPID_PUBLIC_KEY: string
  NUXT_VAPID_PRIVATE_KEY: string
  NUXT_VAPID_SUBJECT: string
}

type NotificationRow = {
  id: string
  type: AdminNotificationJob['type']
  title: string
  body: string
  url: string
  entity_id: string
}

type PushSubscriptionRow = {
  id: string
  endpoint: string
  p256dh: string
  auth: string
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
      subject: env.NUXT_VAPID_SUBJECT,
      publicKey: env.NUXT_VAPID_PUBLIC_KEY,
      privateKey: env.NUXT_VAPID_PRIVATE_KEY
    }
  )

  return fetch(subscription.endpoint, request as RequestInit)
}

async function handleNotification(job: AdminNotificationJob, env: Env) {
  const notification = await env.DB.prepare(
    `SELECT id, type, title, body, url, entity_id FROM admin_notifications WHERE id = ?`
  )
    .bind(job.notificationId)
    .first<NotificationRow>()

  if (!notification) {
    return
  }

  const subscriptions = await env.DB.prepare(
    `SELECT push_subscriptions.id, push_subscriptions.endpoint, push_subscriptions.p256dh, push_subscriptions.auth
     FROM push_subscriptions
     INNER JOIN users ON users.id = push_subscriptions.user_id
     WHERE users.role = 'OWNER' AND push_subscriptions.disabled_at IS NULL`
  ).all<PushSubscriptionRow>()

  const payload: AdminPushPayload = {
    type: notification.type,
    title: notification.title,
    body: notification.body,
    url: notification.url || '/dashboard/inbox',
    notificationId: notification.id,
    entityId: notification.entity_id
  }

  await Promise.all(
    subscriptions.results.map(async (subscription) => {
      try {
        const response = await sendPush(env, subscription, payload)

        if (response.status === 404 || response.status === 410) {
          await env.DB.prepare(`UPDATE push_subscriptions SET disabled_at = ? WHERE id = ?`)
            .bind(Date.now(), subscription.id)
            .run()
          return
        }

        if (response.ok) {
          await env.DB.prepare(`UPDATE push_subscriptions SET last_used_at = ? WHERE id = ?`)
            .bind(Date.now(), subscription.id)
            .run()
        }
      } catch {
        await env.DB.prepare(`UPDATE push_subscriptions SET disabled_at = ? WHERE id = ?`)
          .bind(Date.now(), subscription.id)
          .run()
      }
    })
  )
}

export default {
  async queue(batch: MessageBatch<AdminNotificationJob>, env: Env) {
    await Promise.all(batch.messages.map((message) => handleNotification(message.body, env)))
  }
}
