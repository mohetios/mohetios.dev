import { GraphQLError } from 'graphql'
import { and, eq, isNull } from 'drizzle-orm'

import { inboxMessages } from '../models/schema'
import type { GraphQLContext } from '../routes/graph'
import { requirePermission } from '../utils/auth'
import { normalizeLeadRow } from '../utils/lead-map'

type LeadStatus = 'NEW' | 'QUALIFIED' | 'FOLLOW_UP' | 'WON' | 'LOST' | 'ARCHIVED'
type LeadPriority = 'LOW' | 'MEDIUM' | 'HIGH'

function now() {
  return Date.now()
}

async function getLeadMessage(db: GraphQLContext['db'], id: string) {
  const rows = await db
    .select()
    .from(inboxMessages)
    .where(
      and(eq(inboxMessages.id, id), eq(inboxMessages.kind, 'LEAD'), isNull(inboxMessages.trashedAt))
    )
    .limit(1)

  if (!rows[0]) {
    throw new GraphQLError('Lead not found')
  }

  return rows[0]
}

function parseFollowUpAt(value?: string | null) {
  if (value == null || value === '') {
    return null
  }

  const parsed = Date.parse(value)

  if (!Number.isFinite(parsed)) {
    throw new GraphQLError('Invalid follow-up date')
  }

  return parsed
}

export async function updateLeadStatus(
  _parent: unknown,
  args: { id: string; status: LeadStatus },
  context: GraphQLContext
) {
  requirePermission(context, 'leads:manage')

  await getLeadMessage(context.db, args.id)

  const updatedAt = now()
  const updateData: Partial<typeof inboxMessages.$inferInsert> = {
    leadStatus: args.status,
    updatedAt
  }

  const rows = await context.db
    .update(inboxMessages)
    .set(updateData)
    .where(eq(inboxMessages.id, args.id))
    .returning()

  return normalizeLeadRow(rows[0]!)
}

export async function updateLeadPriority(
  _parent: unknown,
  args: { id: string; priority?: LeadPriority | null },
  context: GraphQLContext
) {
  requirePermission(context, 'leads:manage')

  await getLeadMessage(context.db, args.id)

  const rows = await context.db
    .update(inboxMessages)
    .set({
      leadPriority: args.priority || null,
      updatedAt: now()
    })
    .where(eq(inboxMessages.id, args.id))
    .returning()

  return normalizeLeadRow(rows[0]!)
}

export async function updateLeadFollowUp(
  _parent: unknown,
  args: { id: string; nextFollowUpAt?: string | null },
  context: GraphQLContext
) {
  requirePermission(context, 'leads:manage')

  await getLeadMessage(context.db, args.id)

  const followUpAt = parseFollowUpAt(args.nextFollowUpAt)
  const updateData: Partial<typeof inboxMessages.$inferInsert> = {
    leadNextFollowUpAt: followUpAt,
    updatedAt: now()
  }

  if (followUpAt) {
    updateData.leadStatus = 'FOLLOW_UP'
  }

  const rows = await context.db
    .update(inboxMessages)
    .set(updateData)
    .where(eq(inboxMessages.id, args.id))
    .returning()

  return normalizeLeadRow(rows[0]!)
}

export async function updateLeadNotes(
  _parent: unknown,
  args: { id: string; notes?: string | null },
  context: GraphQLContext
) {
  requirePermission(context, 'leads:manage')

  await getLeadMessage(context.db, args.id)

  const notes = args.notes?.trim() || null

  if (notes && notes.length > 4000) {
    throw new GraphQLError('Notes are too long')
  }

  const rows = await context.db
    .update(inboxMessages)
    .set({
      leadNotes: notes,
      updatedAt: now()
    })
    .where(eq(inboxMessages.id, args.id))
    .returning()

  return normalizeLeadRow(rows[0]!)
}

export const leadMutations = {
  updateLeadStatus,
  updateLeadPriority,
  updateLeadFollowUp,
  updateLeadNotes
}
