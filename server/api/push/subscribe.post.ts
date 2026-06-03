import { createError, defineEventHandler, getHeader, readBody } from 'h3'

import { savePushSubscription } from '../../services/push/save-push-subscription'
import type { PushSubscriptionInput } from '../../../shared/contracts/push'
import { requireOwnerPushContext } from '../../utils/push-auth'

function isPushSubscriptionInput(value: unknown): value is PushSubscriptionInput {
  if (!value || typeof value !== 'object') {
    return false
  }

  const subscription = value as Partial<PushSubscriptionInput>

  return (
    typeof subscription.endpoint === 'string' &&
    Boolean(subscription.endpoint.trim()) &&
    typeof subscription.keys?.p256dh === 'string' &&
    Boolean(subscription.keys.p256dh.trim()) &&
    typeof subscription.keys?.auth === 'string' &&
    Boolean(subscription.keys.auth.trim())
  )
}

export default defineEventHandler(async (event) => {
  const { db, userId } = await requireOwnerPushContext(event)
  const body = await readBody<{
    subscription: PushSubscriptionInput
    deviceLabel?: string | null
  }>(event)

  if (!isPushSubscriptionInput(body.subscription)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid push subscription'
    })
  }

  const subscription = await savePushSubscription(db, {
    userId,
    subscription: body.subscription,
    userAgent: getHeader(event, 'user-agent'),
    deviceLabel: body.deviceLabel
  })

  return {
    id: subscription.id
  }
})
