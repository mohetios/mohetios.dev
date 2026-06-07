import { and, desc, eq, inArray, isNotNull, isNull, like, or, sql, type SQL } from 'drizzle-orm'

import { inboxMessages, inboxReplies } from '../models/schema'
import type { GraphQLContext } from '../routes/graph'
import { requirePermission } from '../utils/auth'
import {
  createInboxThreadEvents,
  normalizeInboxMessageRow,
  normalizeInboxReplyRow
} from '../utils/inbox-map'

type InboxFilter =
  | 'UNREAD'
  | 'ALL'
  | 'NEEDS_REPLY'
  | 'LEAD'
  | 'REPLIED'
  | 'ARCHIVED'
  | 'SPAM'
  | 'TRASH'

type InboxWorkspaceInput = {
  filter?: InboxFilter | null
  search?: string | null
  selectedMessageId?: string | null
  limit?: number | null
  offset?: number | null
}

function buildTrashScopeCondition(filter: InboxFilter): SQL {
  if (filter === 'TRASH') {
    return isNotNull(inboxMessages.trashedAt)
  }

  return isNull(inboxMessages.trashedAt)
}

function buildFilterCondition(filter: InboxFilter): SQL | undefined {
  if (filter === 'TRASH') {
    return undefined
  }

  if (filter === 'UNREAD') {
    return eq(inboxMessages.status, 'NEW')
  }

  if (filter === 'NEEDS_REPLY') {
    return inArray(inboxMessages.status, ['NEW', 'OPEN'])
  }

  if (filter === 'LEAD') {
    return inArray(inboxMessages.kind, ['LEAD', 'COLLABORATION'])
  }

  if (filter === 'REPLIED') {
    return eq(inboxMessages.status, 'REPLIED')
  }

  if (filter === 'ARCHIVED') {
    return eq(inboxMessages.status, 'ARCHIVED')
  }

  if (filter === 'SPAM') {
    return or(eq(inboxMessages.status, 'SPAM'), eq(inboxMessages.kind, 'SPAM'))
  }

  return undefined
}

function buildSearchCondition(search?: string | null): SQL | undefined {
  const query = search?.trim()

  if (!query) {
    return undefined
  }

  const pattern = `%${query}%`

  return or(
    like(inboxMessages.senderName, pattern),
    like(inboxMessages.senderEmail, pattern),
    like(inboxMessages.senderCompany, pattern),
    like(inboxMessages.subject, pattern),
    like(inboxMessages.bodyText, pattern)
  )
}

async function getInboxSummary(db: GraphQLContext['db']) {
  const activeOnly = isNull(inboxMessages.trashedAt)

  const [
    unreadRows,
    needsReplyRows,
    leadRows,
    archivedRows,
    spamRows,
    trashRows,
    totalRows
  ] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(inboxMessages)
      .where(and(activeOnly, eq(inboxMessages.status, 'NEW'))),

    db
      .select({ count: sql<number>`count(*)` })
      .from(inboxMessages)
      .where(and(activeOnly, inArray(inboxMessages.status, ['NEW', 'OPEN']))),

    db
      .select({ count: sql<number>`count(*)` })
      .from(inboxMessages)
      .where(and(activeOnly, inArray(inboxMessages.kind, ['LEAD', 'COLLABORATION']))),

    db
      .select({ count: sql<number>`count(*)` })
      .from(inboxMessages)
      .where(and(activeOnly, eq(inboxMessages.status, 'ARCHIVED'))),

    db
      .select({ count: sql<number>`count(*)` })
      .from(inboxMessages)
      .where(
        and(
          activeOnly,
          or(eq(inboxMessages.status, 'SPAM'), eq(inboxMessages.kind, 'SPAM'))
        )
      ),

    db
      .select({ count: sql<number>`count(*)` })
      .from(inboxMessages)
      .where(isNotNull(inboxMessages.trashedAt)),

    db
      .select({ count: sql<number>`count(*)` })
      .from(inboxMessages)
      .where(activeOnly)
  ])

  return {
    unread: Number(unreadRows[0]?.count || 0),
    needsReply: Number(needsReplyRows[0]?.count || 0),
    leads: Number(leadRows[0]?.count || 0),
    archived: Number(archivedRows[0]?.count || 0),
    spam: Number(spamRows[0]?.count || 0),
    trash: Number(trashRows[0]?.count || 0),
    total: Number(totalRows[0]?.count || 0)
  }
}

export async function inboxWorkspace(
  _parent: unknown,
  args: { input?: InboxWorkspaceInput | null },
  context: GraphQLContext
) {
  requirePermission(context, 'inbox:manage')

  const input = args.input || {}
  const filter = input.filter || 'ALL'
  const limit = Math.min(Math.max(input.limit || 50, 1), 100)
  const offset = Math.max(input.offset || 0, 0)

  const conditions = [
    buildTrashScopeCondition(filter),
    buildFilterCondition(filter),
    buildSearchCondition(input.search)
  ].filter((condition): condition is SQL => Boolean(condition))

  const whereCondition = conditions.length ? and(...conditions) : undefined

  const messageQuery = context.db.select().from(inboxMessages)

  const [summary, messageRows] = await Promise.all([
    getInboxSummary(context.db),
    whereCondition
      ? messageQuery
          .where(whereCondition)
          .orderBy(desc(inboxMessages.lastActivityAt))
          .limit(limit)
          .offset(offset)
      : messageQuery.orderBy(desc(inboxMessages.lastActivityAt)).limit(limit).offset(offset)
  ])

  const messages = messageRows.map(normalizeInboxMessageRow)

  let selectedRow = input.selectedMessageId
    ? messageRows.find((message) => message.id === input.selectedMessageId)
    : messageRows[0]

  if (input.selectedMessageId && !selectedRow) {
    const rows = await context.db
      .select()
      .from(inboxMessages)
      .where(eq(inboxMessages.id, input.selectedMessageId))
      .limit(1)

    selectedRow = rows[0]
  }

  const selectedMessage = selectedRow ? normalizeInboxMessageRow(selectedRow) : null

  const replyRows = selectedMessage
    ? await context.db
        .select()
        .from(inboxReplies)
        .where(eq(inboxReplies.inboxMessageId, selectedMessage.id))
        .orderBy(inboxReplies.createdAt)
    : []

  const replies = replyRows.map(normalizeInboxReplyRow)

  return {
    summary,
    messages,
    selectedMessage,
    replies,
    threadEvents: createInboxThreadEvents(selectedMessage, replies)
  }
}

export const inboxWorkspaceQueries = {
  inboxWorkspace
}
