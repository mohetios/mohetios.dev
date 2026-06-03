import { defineEventHandler, getHeader, readBody } from 'h3'

import { savePushSubscription } from '../../services/push/save-push-subscription'
import type { PushSubscriptionInput } from '../../../shared/contracts/push'
import { requireOwnerPushContext } from '../../utils/push-auth'

export default defineEventHandler(async (event) => {
  const { db, userId } = await requireOwnerPushContext(event)
  const body = await readBody<{
    subscription: PushSubscriptionInput
    deviceLabel?: string | null
  }>(event)

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
