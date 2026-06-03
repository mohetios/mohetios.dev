import { buildPushPayload } from '@block65/webcrypto-web-push'

import type { AdminPushPayload } from '../../../shared/contracts/notifications'

export async function sendWebPush(
  env: {
    VAPID_PUBLIC_KEY: string
    VAPID_PRIVATE_KEY: string
    VAPID_SUBJECT: string
  },
  subscription: {
    endpoint: string
    p256dh: string
    auth: string
  },
  payload: AdminPushPayload
) {
  if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY || !env.VAPID_SUBJECT) {
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
      subject: env.VAPID_SUBJECT,
      publicKey: env.VAPID_PUBLIC_KEY,
      privateKey: env.VAPID_PRIVATE_KEY
    }
  )

  return fetch(subscription.endpoint, request as RequestInit)
}
