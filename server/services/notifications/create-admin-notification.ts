import type { AppDb } from '../../models/client'
import { adminNotifications } from '../../models/schema'
import { createId } from '../../utils/id'

export async function createAdminNotification(
  db: AppDb,
  input: {
    type: 'NEW_INBOUND_EMAIL' | 'NEW_CONTACT_MESSAGE'
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
