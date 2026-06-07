import { eq } from 'drizzle-orm'

import type { AppDb } from '../../models/client'
import { inboxMessages } from '../../models/schema'

export async function markMessageKind(
  db: AppDb,
  id: string,
  kind: 'LEAD' | 'COLLABORATION' | 'PERSONAL' | 'SUPPORT' | 'OTHER' | 'SPAM'
) {
  const now = Date.now()
  const existing = await db
    .select({ leadStatus: inboxMessages.leadStatus })
    .from(inboxMessages)
    .where(eq(inboxMessages.id, id))
    .limit(1)

  const updateData: Partial<typeof inboxMessages.$inferInsert> = {
    kind,
    updatedAt: now,
    lastActivityAt: now
  }

  if (kind === 'LEAD' && !existing[0]?.leadStatus) {
    updateData.leadStatus = 'NEW'
  }

  const [message] = await db
    .update(inboxMessages)
    .set(updateData)
    .where(eq(inboxMessages.id, id))
    .returning()

  return message
}
