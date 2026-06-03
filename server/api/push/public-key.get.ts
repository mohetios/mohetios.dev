import { createError, defineEventHandler } from 'h3'

import { requireOwnerPushContext } from '../../utils/push-auth'

export default defineEventHandler(async (event) => {
  const { env } = await requireOwnerPushContext(event)

  if (!env.NUXT_VAPID_PUBLIC_KEY) {
    throw createError({
      statusCode: 500,
      statusMessage: 'VAPID public key is not configured'
    })
  }

  return {
    publicKey: env.NUXT_VAPID_PUBLIC_KEY
  }
})
