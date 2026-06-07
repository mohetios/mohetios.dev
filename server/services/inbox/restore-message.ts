import { eq } from 'drizzle-orm'

import type { AppDb } from '../../models/client'
import { inboxMessages } from '../../models/schema'

export async function restoreMessage(db: AppDb, id: string) {
  const now = Date.now()

  const [updated] = await db
    .update(inboxMessages)
    .set({
      trashedAt: null,
      updatedAt: now,
      lastActivityAt: now
    })
    .where(eq(inboxMessages.id, id))
    .returning()

  return updated || null
}
