import { and, eq } from 'drizzle-orm'

import type { AppDb } from '../../models/client'
import { adminNotifications, inboxMessages, inboxReplies } from '../../models/schema'

export async function deleteMessageForever(db: AppDb, id: string) {
  const [message] = await db
    .select()
    .from(inboxMessages)
    .where(eq(inboxMessages.id, id))
    .limit(1)

  if (!message) {
    return { found: false as const, deleted: false as const }
  }

  if (!message.trashedAt) {
    throw new Error('Move conversation to trash before deleting forever')
  }

  await db.delete(inboxReplies).where(eq(inboxReplies.inboxMessageId, id))
  await db
    .delete(adminNotifications)
    .where(
      and(eq(adminNotifications.entityType, 'inboxMessage'), eq(adminNotifications.entityId, id))
    )
  await db.delete(inboxMessages).where(eq(inboxMessages.id, id))

  return { found: true as const, deleted: true as const }
}
