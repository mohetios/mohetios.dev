import { eq } from 'drizzle-orm'

import type { AppDb } from '../../models/client'
import { inboxMessages } from '../../models/schema'

export async function trashMessage(db: AppDb, id: string) {
  const [existing] = await db
    .select()
    .from(inboxMessages)
    .where(eq(inboxMessages.id, id))
    .limit(1)

  if (!existing) {
    return null
  }

  if (existing.trashedAt) {
    return existing
  }

  const now = Date.now()

  const [updated] = await db
    .update(inboxMessages)
    .set({
      trashedAt: now,
      updatedAt: now,
      lastActivityAt: now
    })
    .where(eq(inboxMessages.id, id))
    .returning()

  return updated || null
}
