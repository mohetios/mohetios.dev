import { defineEventHandler } from 'h3'

import { requireOwnerPushContext } from '../../utils/push-auth'

export default defineEventHandler(async (event) => {
  const { env } = await requireOwnerPushContext(event)

  return {
    publicKey: env.VAPID_PUBLIC_KEY
  }
})
