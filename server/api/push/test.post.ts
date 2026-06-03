import { createError, defineEventHandler } from 'h3'

import { createAdminNotification } from '../../services/notifications/create-admin-notification'
import type { AdminNotificationJob } from '../../../shared/contracts/notifications'
import { requireOwnerPushContext } from '../../utils/push-auth'

export default defineEventHandler(async (event) => {
  const { db, env } = await requireOwnerPushContext(event)

  if (!env.ADMIN_NOTIFICATION_QUEUE) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Admin notification queue binding is not configured'
    })
  }

  const notification = await createAdminNotification(db, {
    type: 'NEW_CONTACT_MESSAGE',
    title: 'Test notification',
    body: 'Push notifications are connected.',
    url: '/dashboard/inbox',
    entityType: 'system',
    entityId: 'test'
  })

  await env.ADMIN_NOTIFICATION_QUEUE.send({
    type: 'NEW_CONTACT_MESSAGE',
    inboxMessageId: 'test',
    notificationId: notification.id
  } satisfies AdminNotificationJob)

  return { ok: true, notificationId: notification.id }
})
