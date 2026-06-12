import { and, desc, eq, inArray, isNull, sql } from 'drizzle-orm'

import { adminNotifications, comments, inboxMessages, newsletterSubscribers } from '../models/schema'
import type { GraphQLContext } from '../routes/graph'
import { requirePermission } from '../utils/auth'
import {
  getCachedCloudflareAnalytics,
  type AnalyticsRange
} from '../utils/cloudflare-analytics'

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
  args: { range?: AnalyticsRange | null },
  context: GraphQLContext
) {
  const range = args.range || 'LAST_7_DAYS'
  requirePermission(context, 'dashboard:view')

  const { db } = context

  const activeOnly = isNull(inboxMessages.trashedAt)

  const [
    unreadRows,
    needsReplyRows,
    leadRows,
    newsletterRows,
    pendingCommentRows,
    inboxPreviewRows,
    notificationRows
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
        .where(and(activeOnly, eq(inboxMessages.kind, 'LEAD'))),

      db
        .select({ count: sql<number>`count(*)` })
        .from(newsletterSubscribers)
        .where(eq(newsletterSubscribers.status, 'subscribed')),

      db
        .select({ count: sql<number>`count(*)` })
        .from(comments)
        .where(eq(comments.status, 'PENDING')),

      db
        .select()
        .from(inboxMessages)
        .where(activeOnly)
        .orderBy(desc(inboxMessages.createdAt))
        .limit(5),

      db.select().from(adminNotifications).orderBy(desc(adminNotifications.createdAt)).limit(8)
    ])

  const inboxUnread = Number(unreadRows[0]?.count || 0)
  const needsReply = Number(needsReplyRows[0]?.count || 0)
  const leads = Number(leadRows[0]?.count || 0)
  const newsletterSubscriberCount = Number(newsletterRows[0]?.count || 0)
  const pendingComments = Number(pendingCommentRows[0]?.count || 0)

  const analytics = await getCachedCloudflareAnalytics(context.event, range)
  const audienceTrend = analytics.trend

  const visits = audienceTrend.reduce(
    (sum: number, point: { visitors: number }) => sum + point.visitors,
    0
  )
  const pageViews = audienceTrend.reduce(
    (sum: number, point: { pageViews: number }) => sum + point.pageViews,
    0
  )

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
      newsletterSubscribers: newsletterSubscriberCount,
      pendingComments,
      visits,
      pageViews,
      searchClicks: 0,
      avgLoadMs: 0
    },

    audienceTrend,

    inboxPreview,

    readerSignals: [
      {
        label: 'Inbox focus',
        value: String(needsReply),
        helper: 'Messages currently waiting for a reply',
        icon: 'i-lucide-inbox'
      },
      {
        label: 'Lead quality',
        value: String(leads),
        helper: 'Potential work or collaboration messages',
        icon: 'i-lucide-user-plus'
      },
      {
        label: 'Comments',
        value: String(pendingComments),
        helper: 'Comments waiting for moderation',
        icon: 'i-lucide-message-square'
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
        status: analytics.isConfigured && !analytics.isPartial ? 'ok' : 'pending',
        helper: analytics.dataSourceDescription
      },
      {
        key: 'comments',
        label: 'Comments',
        status: pendingComments > 0 ? 'pending' : 'ok',
        helper:
          pendingComments > 0
            ? 'Some comments are waiting for moderation'
            : 'No pending comments'
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
        key: 'newsletter',
        label: 'Newsletter',
        description: 'Review subscribers and list status',
        icon: 'i-lucide-mail-plus',
        to: '/dashboard/newsletter'
      },
      {
        key: 'comments',
        label: 'Comments',
        description: 'Moderate pending article comments',
        icon: 'i-lucide-message-square',
        to: '/dashboard/comments'
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
