import { desc, eq, inArray, sql } from 'drizzle-orm'

import { adminNotifications, inboxMessages } from '../models/schema'
import type { GraphQLContext } from '../routes/graph'
import { requirePermission } from '../utils/auth'

// D1 remains source of truth. KV can cache dashboardHome as dashboard:home:v1 (60s TTL)
// later for snapshots and external analytics rollups only — not inbox truth or auth state.

function toLowerValue(value: unknown) {
  return String(value || '').toLowerCase()
}

function toTimestamp(value: unknown) {
  if (typeof value === 'number') return value

  if (value instanceof Date) {
    return value.getTime()
  }

  if (typeof value === 'string') {
    const parsed = Date.parse(value)
    return Number.isFinite(parsed) ? parsed : Date.now()
  }

  return Date.now()
}

function createEmptyAudienceTrend() {
  return Array.from({ length: 7 }).map((_, index) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - index))

    return {
      date: date.toISOString().slice(0, 10),
      visitors: 0,
      pageViews: 0
    }
  })
}

function buildPreview(bodyText: string) {
  return bodyText.length > 160 ? `${bodyText.slice(0, 157).trimEnd()}...` : bodyText
}

function normalizeInboxPreviewMessage(message: typeof inboxMessages.$inferSelect) {
  return {
    id: message.id,
    source: toLowerValue(message.source),
    status: toLowerValue(message.status),
    kind: toLowerValue(message.kind),
    senderName: message.senderName || 'Unknown sender',
    senderEmail: message.senderEmail || '',
    subject: message.subject || 'No subject',
    preview: buildPreview(message.bodyText || ''),
    createdAt: toTimestamp(message.createdAt)
  }
}

export async function dashboardHome(
  _parent: unknown,
  _args: unknown,
  context: GraphQLContext
) {
  requirePermission(context, 'dashboard:view')

  const { db } = context

  const [unreadRows, needsReplyRows, leadRows, inboxPreviewRows, notificationRows] =
    await Promise.all([
      db
        .select({ count: sql<number>`count(*)` })
        .from(inboxMessages)
        .where(eq(inboxMessages.status, 'NEW')),

      db
        .select({ count: sql<number>`count(*)` })
        .from(inboxMessages)
        .where(inArray(inboxMessages.status, ['NEW', 'OPEN'])),

      db
        .select({ count: sql<number>`count(*)` })
        .from(inboxMessages)
        .where(inArray(inboxMessages.kind, ['LEAD', 'COLLABORATION'])),

      db.select().from(inboxMessages).orderBy(desc(inboxMessages.createdAt)).limit(5),

      db
        .select()
        .from(adminNotifications)
        .orderBy(desc(adminNotifications.createdAt))
        .limit(8)
    ])

  const inboxUnread = Number(unreadRows[0]?.count || 0)
  const needsReply = Number(needsReplyRows[0]?.count || 0)
  const leads = Number(leadRows[0]?.count || 0)

  const inboxPreview = inboxPreviewRows.map(normalizeInboxPreviewMessage)

  const recentActivity = [
    ...inboxPreviewRows.map((message) => ({
      id: `inbox:${message.id}`,
      type: 'inbox',
      title: message.subject || 'New inbox message',
      description: `${message.senderName || 'Someone'} sent a message`,
      createdAt: toTimestamp(message.createdAt),
      href: `/dashboard/inbox?message=${message.id}`
    })),
    ...notificationRows.map((notification) => ({
      id: `notification:${notification.id}`,
      type: notification.type || 'notification',
      title: notification.title || 'Notification',
      description: notification.body || '',
      createdAt: toTimestamp(notification.createdAt),
      href: notification.url || null
    }))
  ]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 8)

  return {
    summary: {
      inboxUnread,
      needsReply,
      leads,
      visits: 0,
      pageViews: 0,
      searchClicks: 0,
      avgLoadMs: 0
    },

    audienceTrend: createEmptyAudienceTrend(),

    inboxPreview,

    contentPulse: {
      publishedCount: 0,
      draftCount: 0,
      latestItems: []
    },

    readerSignals: [
      {
        label: 'Inbox signal',
        value: String(needsReply),
        helper: 'Messages currently waiting for a reply',
        icon: 'i-lucide-inbox'
      },
      {
        label: 'Lead signal',
        value: String(leads),
        helper: 'Potential work or collaboration messages',
        icon: 'i-lucide-user-plus'
      }
    ],

    systemHealth: [
      {
        key: 'inbox',
        label: 'Inbox',
        status: 'ok',
        helper: 'Inbox messages are loaded from D1'
      },
      {
        key: 'analytics',
        label: 'Analytics',
        status: 'pending',
        helper: 'External analytics provider is not connected yet'
      },
      {
        key: 'content',
        label: 'Content',
        status: 'pending',
        helper: 'Content metrics are not connected yet'
      }
    ],

    recentActivity,

    quickLinks: [
      {
        key: 'inbox',
        label: 'Open inbox',
        description: 'Review messages and replies',
        icon: 'i-lucide-inbox',
        to: '/dashboard/inbox'
      },
      {
        key: 'leads',
        label: 'Review leads',
        description: 'Check potential freelance and collaboration leads',
        icon: 'i-lucide-users',
        to: '/dashboard/leads'
      },
      {
        key: 'content',
        label: 'Content workspace',
        description: 'Review writing and publishing pipeline',
        icon: 'i-lucide-file-text',
        to: '/blog'
      },
      {
        key: 'system',
        label: 'System status',
        description: 'Check backend and delivery health',
        icon: 'i-lucide-activity',
        to: '/dashboard/analytics'
      }
    ]
  }
}
