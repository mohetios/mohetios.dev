import { eq } from 'drizzle-orm'
import { defineEventHandler, readBody } from 'h3'

import { pushSubscriptions } from '../../models/schema'
import { requireOwnerPushContext } from '../../utils/push-auth'

export default defineEventHandler(async (event) => {
  const { db } = await requireOwnerPushContext(event)
  const body = await readBody<{ endpoint?: string }>(event)

  if (!body.endpoint) {
    return { ok: true }
  }

  await db
    .update(pushSubscriptions)
    .set({
      disabledAt: Date.now()
    })
    .where(eq(pushSubscriptions.endpoint, body.endpoint))

  return { ok: true }
})
