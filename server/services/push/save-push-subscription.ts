import { eq } from 'drizzle-orm'

import type { AppDb } from '../../models/client'
import { pushSubscriptions } from '../../models/schema'
import { createId } from '../../utils/id'
import type { PushSubscriptionInput } from '../../../shared/contracts/push'

export async function savePushSubscription(
  db: AppDb,
  input: {
    userId: string
    subscription: PushSubscriptionInput
    userAgent?: string | null
    deviceLabel?: string | null
  }
) {
  const now = Date.now()
  const existing = await db
    .select()
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.endpoint, input.subscription.endpoint))
    .limit(1)

  if (existing[0]) {
    const [updated] = await db
      .update(pushSubscriptions)
      .set({
        userId: input.userId,
        p256dh: input.subscription.keys.p256dh,
        auth: input.subscription.keys.auth,
        userAgent: input.userAgent || null,
        deviceLabel: input.deviceLabel || null,
        disabledAt: null,
        lastUsedAt: now
      })
      .where(eq(pushSubscriptions.endpoint, input.subscription.endpoint))
      .returning()

    if (!updated) {
      throw new Error('Push subscription could not be updated')
    }

    return updated
  }

  const [created] = await db
    .insert(pushSubscriptions)
    .values({
      id: createId(),
      userId: input.userId,
      endpoint: input.subscription.endpoint,
      p256dh: input.subscription.keys.p256dh,
      auth: input.subscription.keys.auth,
      userAgent: input.userAgent || null,
      deviceLabel: input.deviceLabel || null,
      createdAt: now,
      lastUsedAt: now
    })
    .returning()

  if (!created) {
    throw new Error('Push subscription could not be created')
  }

  return created
}
