import type { AppDb } from '../../models/client'
import { adminNotifications } from '../../models/schema'
import { createId } from '../../utils/id'

type StoredAdminNotificationType = 'NEW_INBOUND_EMAIL' | 'NEW_CONTACT_MESSAGE' | 'NEW_COMMENT'

export async function createAdminNotification(
  db: AppDb,
  input: {
    type: StoredAdminNotificationType
    title: string
    body: string
    url: string
    entityType: string
    entityId: string
  }
) {
  const [notification] = await db
    .insert(adminNotifications)
    .values({
      id: createId(),
      ...input,
      createdAt: Date.now()
    })
    .returning()

  if (!notification) {
    throw new Error('Admin notification could not be created')
  }

  return notification
}
