import { eq } from 'drizzle-orm'

import type { AppDb } from '../../models/client'
import { inboxMessages } from '../../models/schema'

export async function markMessageKind(
  db: AppDb,
  id: string,
  kind: 'LEAD' | 'COLLABORATION' | 'PERSONAL' | 'SUPPORT' | 'OTHER' | 'SPAM'
) {
  const now = Date.now()

  const [message] = await db
    .update(inboxMessages)
    .set({
      kind,
      updatedAt: now,
      lastActivityAt: now
    })
    .where(eq(inboxMessages.id, id))
    .returning()

  return message
}
