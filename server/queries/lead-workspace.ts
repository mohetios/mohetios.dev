import {
  and,
  asc,
  desc,
  eq,
  isNotNull,
  isNull,
  like,
  or,
  sql,
  type SQL
} from 'drizzle-orm'

import { inboxMessages } from '../models/schema'
import type { GraphQLContext } from '../routes/graph'
import { requirePermission } from '../utils/auth'
import { normalizeLeadRow } from '../utils/lead-map'

type LeadFilter =
  | 'NEW'
  | 'QUALIFIED'
  | 'FOLLOW_UP'
  | 'WON'
  | 'LOST'
  | 'ALL'
  | 'ARCHIVED'
  | 'HIGH_PRIORITY'
  | 'NO_FOLLOW_UP'

type LeadsWorkspaceInput = {
  filter?: LeadFilter | null
  search?: string | null
  selectedLeadId?: string | null
  limit?: number | null
  offset?: number | null
}

const baseLeadCondition = and(eq(inboxMessages.kind, 'LEAD'), isNull(inboxMessages.trashedAt))

function buildFilterCondition(filter?: LeadFilter | null): SQL | undefined {
  switch (filter) {
    case 'NEW':
      return or(isNull(inboxMessages.leadStatus), eq(inboxMessages.leadStatus, 'NEW'))
    case 'QUALIFIED':
      return eq(inboxMessages.leadStatus, 'QUALIFIED')
    case 'FOLLOW_UP':
      return isNotNull(inboxMessages.leadNextFollowUpAt)
    case 'WON':
      return eq(inboxMessages.leadStatus, 'WON')
    case 'LOST':
      return eq(inboxMessages.leadStatus, 'LOST')
    case 'ARCHIVED':
      return eq(inboxMessages.leadStatus, 'ARCHIVED')
    case 'HIGH_PRIORITY':
      return or(
        eq(inboxMessages.leadPriority, 'HIGH'),
        and(isNull(inboxMessages.leadPriority), eq(inboxMessages.priority, 'HIGH'))
      )
    case 'NO_FOLLOW_UP':
      return isNull(inboxMessages.leadNextFollowUpAt)
    case 'ALL':
    default:
      return undefined
  }
}

function buildSearchCondition(search?: string | null): SQL | undefined {
  const query = search?.trim()

  if (!query) return undefined

  const pattern = `%${query}%`

  return or(
    like(inboxMessages.senderName, pattern),
    like(inboxMessages.senderEmail, pattern),
    like(inboxMessages.senderCompany, pattern),
    like(inboxMessages.subject, pattern),
    like(inboxMessages.bodyText, pattern)
  )
}

async function getLeadSummary(db: GraphQLContext['db']) {
  const [totalRows, newRows, qualifiedRows, followUpRows, wonRows, lostRows, archivedRows] =
    await Promise.all([
      db
        .select({ count: sql<number>`count(*)` })
        .from(inboxMessages)
        .where(baseLeadCondition),

      db
        .select({ count: sql<number>`count(*)` })
        .from(inboxMessages)
        .where(
          and(
            baseLeadCondition,
            or(isNull(inboxMessages.leadStatus), eq(inboxMessages.leadStatus, 'NEW'))
          )
        ),

      db
        .select({ count: sql<number>`count(*)` })
        .from(inboxMessages)
        .where(and(baseLeadCondition, eq(inboxMessages.leadStatus, 'QUALIFIED'))),

      db
        .select({ count: sql<number>`count(*)` })
        .from(inboxMessages)
        .where(and(baseLeadCondition, isNotNull(inboxMessages.leadNextFollowUpAt))),

      db
        .select({ count: sql<number>`count(*)` })
        .from(inboxMessages)
        .where(and(baseLeadCondition, eq(inboxMessages.leadStatus, 'WON'))),

      db
        .select({ count: sql<number>`count(*)` })
        .from(inboxMessages)
        .where(and(baseLeadCondition, eq(inboxMessages.leadStatus, 'LOST'))),

      db
        .select({ count: sql<number>`count(*)` })
        .from(inboxMessages)
        .where(and(baseLeadCondition, eq(inboxMessages.leadStatus, 'ARCHIVED')))
    ])

  return {
    total: Number(totalRows[0]?.count || 0),
    new: Number(newRows[0]?.count || 0),
    qualified: Number(qualifiedRows[0]?.count || 0),
    followUp: Number(followUpRows[0]?.count || 0),
    won: Number(wonRows[0]?.count || 0),
    lost: Number(lostRows[0]?.count || 0),
    archived: Number(archivedRows[0]?.count || 0)
  }
}

export async function leadsWorkspace(
  _parent: unknown,
  args: { input?: LeadsWorkspaceInput | null },
  context: GraphQLContext
) {
  requirePermission(context, 'leads:manage')

  const input = args.input || {}
  const filter = input.filter || 'NEW'
  const limit = Math.min(Math.max(input.limit || 50, 1), 100)
  const offset = Math.max(input.offset || 0, 0)

  const conditions = [
    baseLeadCondition,
    buildFilterCondition(filter),
    buildSearchCondition(input.search)
  ].filter((condition): condition is SQL => Boolean(condition))

  const whereCondition = and(...conditions)
  const orderBy =
    filter === 'FOLLOW_UP'
      ? [asc(inboxMessages.leadNextFollowUpAt), desc(inboxMessages.lastActivityAt)]
      : [desc(inboxMessages.lastActivityAt)]

  const [summary, messageRows] = await Promise.all([
    getLeadSummary(context.db),
    context.db
      .select()
      .from(inboxMessages)
      .where(whereCondition)
      .orderBy(...orderBy)
      .limit(limit)
      .offset(offset)
  ])

  const leads = messageRows.map(normalizeLeadRow)

  let selectedRow = input.selectedLeadId
    ? messageRows.find((message) => message.id === input.selectedLeadId)
    : undefined

  if (input.selectedLeadId && !selectedRow) {
    const rows = await context.db
      .select()
      .from(inboxMessages)
      .where(
        and(
          eq(inboxMessages.id, input.selectedLeadId),
          eq(inboxMessages.kind, 'LEAD'),
          isNull(inboxMessages.trashedAt)
        )
      )
      .limit(1)

    selectedRow = rows[0]
  }

  return {
    summary,
    leads,
    selectedLead: selectedRow ? normalizeLeadRow(selectedRow) : null
  }
}

export const leadsWorkspaceQueries = {
  leadsWorkspace
}
