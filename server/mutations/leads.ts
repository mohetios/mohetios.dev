import { GraphQLError } from 'graphql'
import { eq } from 'drizzle-orm'

import { inboxMessages } from '../models/schema'
import type { GraphQLContext } from '../routes/graph'
import { requirePermission } from '../utils/auth'
import { normalizeLeadRow } from '../utils/lead-map'

type UpdateLeadReviewInput = {
  id: string
  status?: 'NEW' | 'OPEN' | 'REPLIED' | 'ARCHIVED' | 'SPAM' | null
  kind?: 'LEAD' | 'COLLABORATION' | 'PERSONAL' | 'SUPPORT' | 'OTHER' | 'SPAM' | null
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | null
}

function now() {
  return Date.now()
}

export async function updateLeadReview(
  _parent: unknown,
  args: { input: UpdateLeadReviewInput },
  context: GraphQLContext
) {
  requirePermission(context, 'inbox:manage')

  const updatedAt = now()

  const updateData: Partial<typeof inboxMessages.$inferInsert> = {
    updatedAt,
    lastActivityAt: updatedAt
  }

  if (args.input.status) {
    updateData.status = args.input.status
  }

  if (args.input.kind) {
    updateData.kind = args.input.kind
  }

  if (args.input.priority) {
    updateData.priority = args.input.priority
  }

  const rows = await context.db
    .update(inboxMessages)
    .set(updateData)
    .where(eq(inboxMessages.id, args.input.id))
    .returning()

  if (!rows[0]) {
    throw new GraphQLError('Lead not found')
  }

  return normalizeLeadRow(rows[0])
}

export async function markLeadQualified(
  _parent: unknown,
  args: { id: string },
  context: GraphQLContext
) {
  requirePermission(context, 'inbox:manage')

  const updatedAt = now()

  const rows = await context.db
    .update(inboxMessages)
    .set({
      kind: 'LEAD',
      status: 'OPEN',
      priority: 'HIGH',
      updatedAt,
      lastActivityAt: updatedAt
    })
    .where(eq(inboxMessages.id, args.id))
    .returning()

  if (!rows[0]) {
    throw new GraphQLError('Lead not found')
  }

  return normalizeLeadRow(rows[0])
}

export async function archiveLead(
  _parent: unknown,
  args: { id: string },
  context: GraphQLContext
) {
  requirePermission(context, 'inbox:manage')

  const updatedAt = now()

  const rows = await context.db
    .update(inboxMessages)
    .set({
      status: 'ARCHIVED',
      updatedAt,
      lastActivityAt: updatedAt
    })
    .where(eq(inboxMessages.id, args.id))
    .returning()

  if (!rows[0]) {
    throw new GraphQLError('Lead not found')
  }

  return normalizeLeadRow(rows[0])
}

export const leadMutations = {
  updateLeadReview,
  markLeadQualified,
  archiveLead
}
