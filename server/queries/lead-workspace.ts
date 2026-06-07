import { and, desc, eq, inArray, isNull, like, or, sql, type SQL } from 'drizzle-orm'

import { inboxMessages } from '../models/schema'
import type { GraphQLContext } from '../routes/graph'
import { requirePermission } from '../utils/auth'
import { normalizeLeadRow } from '../utils/lead-map'

type LeadReviewStatusFilter = 'ALL' | 'NEW' | 'OPEN' | 'REPLIED' | 'ARCHIVED' | 'SPAM'
type LeadReviewTypeFilter =
  | 'ALL'
  | 'LEAD'
  | 'COLLABORATION'
  | 'PERSONAL'
  | 'SUPPORT'
  | 'OTHER'
type LeadReviewSourceFilter = 'ALL' | 'EMAIL' | 'CONTACT_FORM'
type LeadReviewPriorityFilter = 'ALL' | 'LOW' | 'NORMAL' | 'HIGH'

type LeadWorkspaceInput = {
  status?: LeadReviewStatusFilter | null
  type?: LeadReviewTypeFilter | null
  source?: LeadReviewSourceFilter | null
  priority?: LeadReviewPriorityFilter | null
  search?: string | null
  selectedLeadId?: string | null
  limit?: number | null
  offset?: number | null
}

function buildStatusCondition(status?: LeadReviewStatusFilter | null): SQL | undefined {
  if (!status || status === 'ALL') return undefined
  return eq(inboxMessages.status, status)
}

function buildTypeCondition(type?: LeadReviewTypeFilter | null): SQL | undefined {
  if (!type || type === 'ALL') {
    return inArray(inboxMessages.kind, ['LEAD', 'COLLABORATION'])
  }

  return eq(inboxMessages.kind, type)
}

function buildSourceCondition(source?: LeadReviewSourceFilter | null): SQL | undefined {
  if (!source || source === 'ALL') return undefined
  return eq(inboxMessages.source, source)
}

function buildPriorityCondition(priority?: LeadReviewPriorityFilter | null): SQL | undefined {
  if (!priority || priority === 'ALL') return undefined
  return eq(inboxMessages.priority, priority)
}

function buildSearchCondition(search?: string | null): SQL | undefined {
  const query = search?.trim()

  if (!query) return undefined

  const pattern = `%${query}%`

  return or(
    like(inboxMessages.senderName, pattern),
    like(inboxMessages.senderEmail, pattern),
    like(inboxMessages.senderCompany, pattern),
    like(inboxMessages.senderWebsite, pattern),
    like(inboxMessages.subject, pattern),
    like(inboxMessages.bodyText, pattern)
  )
}

async function getLeadSummary(db: GraphQLContext['db']) {
  const baseLeadCondition = and(
    inArray(inboxMessages.kind, ['LEAD', 'COLLABORATION']),
    isNull(inboxMessages.trashedAt)
  )

  const [totalRows, newRows, qualifiedRows, highPriorityRows, archivedRows] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(inboxMessages)
      .where(baseLeadCondition),

    db
      .select({ count: sql<number>`count(*)` })
      .from(inboxMessages)
      .where(and(baseLeadCondition, eq(inboxMessages.status, 'NEW'))),

    db
      .select({ count: sql<number>`count(*)` })
      .from(inboxMessages)
      .where(
        and(
          eq(inboxMessages.kind, 'LEAD'),
          inArray(inboxMessages.status, ['OPEN', 'REPLIED'])
        )
      ),

    db
      .select({ count: sql<number>`count(*)` })
      .from(inboxMessages)
      .where(and(baseLeadCondition, eq(inboxMessages.priority, 'HIGH'))),

    db
      .select({ count: sql<number>`count(*)` })
      .from(inboxMessages)
      .where(and(baseLeadCondition, eq(inboxMessages.status, 'ARCHIVED')))
  ])

  return {
    total: Number(totalRows[0]?.count || 0),
    new: Number(newRows[0]?.count || 0),
    qualified: Number(qualifiedRows[0]?.count || 0),
    highPriority: Number(highPriorityRows[0]?.count || 0),
    archived: Number(archivedRows[0]?.count || 0)
  }
}

export async function leadWorkspace(
  _parent: unknown,
  args: { input?: LeadWorkspaceInput | null },
  context: GraphQLContext
) {
  requirePermission(context, 'inbox:manage')

  const input = args.input || {}
  const limit = Math.min(Math.max(input.limit || 50, 1), 100)
  const offset = Math.max(input.offset || 0, 0)

  const conditions = [
    isNull(inboxMessages.trashedAt),
    buildTypeCondition(input.type),
    buildStatusCondition(input.status),
    buildSourceCondition(input.source),
    buildPriorityCondition(input.priority),
    buildSearchCondition(input.search)
  ].filter((condition): condition is SQL => Boolean(condition))

  const whereCondition = conditions.length ? and(...conditions) : undefined

  const messageQuery = context.db.select().from(inboxMessages)

  const [summary, messageRows] = await Promise.all([
    getLeadSummary(context.db),
    whereCondition
      ? messageQuery
          .where(whereCondition)
          .orderBy(desc(inboxMessages.lastActivityAt))
          .limit(limit)
          .offset(offset)
      : messageQuery
          .where(
            and(
              isNull(inboxMessages.trashedAt),
              inArray(inboxMessages.kind, ['LEAD', 'COLLABORATION'])
            )
          )
          .orderBy(desc(inboxMessages.lastActivityAt))
          .limit(limit)
          .offset(offset)
  ])

  const leads = messageRows.map(normalizeLeadRow)

  let selectedRow = input.selectedLeadId
    ? messageRows.find((message) => message.id === input.selectedLeadId)
    : messageRows[0]

  if (input.selectedLeadId && !selectedRow) {
    const rows = await context.db
      .select()
      .from(inboxMessages)
      .where(eq(inboxMessages.id, input.selectedLeadId))
      .limit(1)

    selectedRow = rows[0]
  }

  return {
    summary,
    leads,
    selectedLead: selectedRow ? normalizeLeadRow(selectedRow) : null
  }
}

export const leadWorkspaceQueries = {
  leadWorkspace
}
