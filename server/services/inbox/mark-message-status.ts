import { eq } from 'drizzle-orm'

import type { AppDb } from '../../models/client'
import { inboxMessages } from '../../models/schema'

export async function markMessageStatus(
  db: AppDb,
  id: string,
  status: 'NEW' | 'OPEN' | 'REPLIED' | 'ARCHIVED' | 'SPAM'
) {
  const [message] = await db
    .update(inboxMessages)
    .set({
      status,
      updatedAt: Date.now(),
      lastActivityAt: Date.now()
    })
    .where(eq(inboxMessages.id, id))
    .returning()

  return message
}
