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

const demoAudienceSeed = [
  { visitors: 36, pageViews: 92 },
  { visitors: 42, pageViews: 118 },
  { visitors: 39, pageViews: 104 },
  { visitors: 57, pageViews: 149 },
  { visitors: 63, pageViews: 172 },
  { visitors: 51, pageViews: 136 },
  { visitors: 74, pageViews: 211 }
] as const

const demoInboxPreview = [
  {
    id: 'demo-lead-001',
    source: 'contact_form',
    status: 'new',
    kind: 'lead',
    senderName: 'Nadia Rahimi',
    senderEmail: 'nadia@example.com',
    subject: 'Edge dashboard consultation',
    preview: 'Interested in a small Cloudflare/Nuxt review before launch.',
    createdAtOffsetHours: 3
  },
  {
    id: 'demo-collab-001',
    source: 'email',
    status: 'open',
    kind: 'collaboration',
    senderName: 'Arman Studio',
    senderEmail: 'hello@arman.example',
    subject: 'Technical writing collaboration',
    preview: 'We are planning a short engineering notebook series and liked your system notes.',
    createdAtOffsetHours: 18
  },
  {
    id: 'demo-support-001',
    source: 'contact_form',
    status: 'replied',
    kind: 'support',
    senderName: 'Leila Omid',
    senderEmail: 'leila@example.com',
    subject: 'Question about the portfolio stack',
    preview: 'Thanks for sharing the breakdown. One follow-up about D1 migrations.',
    createdAtOffsetHours: 34
  }
] as const

const demoContentItems = [
  {
    id: 'demo-content-edge-notes',
    title: 'Edge notes: keeping GraphQL small',
    slug: '/blog/edge-notes-graphql',
    section: 'Blog',
    status: 'published',
    updatedAtOffsetHours: 9
  },
  {
    id: 'demo-content-inbox-lab',
    title: 'Inbox as a lightweight operating surface',
    slug: '/lab/inbox-operating-surface',
    section: 'Lab',
    status: 'draft',
    updatedAtOffsetHours: 27
  },
  {
    id: 'demo-content-cloudflare-d1',
    title: 'D1 patterns for tiny products',
    slug: '/blog/d1-patterns-tiny-products',
    section: 'Blog',
    status: 'published',
    updatedAtOffsetHours: 52
  }
] as const

function createDemoAudienceTrend() {
  return demoAudienceSeed.map((point, index) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - index))

    return {
      date: date.toISOString().slice(0, 10),
      visitors: point.visitors,
      pageViews: point.pageViews
    }
  })
}

function offsetTimestamp(hours: number) {
  return Date.now() - hours * 60 * 60 * 1000
}

function createDemoInboxPreview() {
  return demoInboxPreview.map((message) => ({
    id: message.id,
    source: message.source,
    status: message.status,
    kind: message.kind,
    senderName: message.senderName,
    senderEmail: message.senderEmail,
    subject: message.subject,
    preview: message.preview,
    createdAt: offsetTimestamp(message.createdAtOffsetHours)
  }))
}

function createDemoContentPulse() {
  return {
    publishedCount: 12,
    draftCount: 4,
    latestItems: demoContentItems.map((item) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      section: item.section,
      status: item.status,
      updatedAt: offsetTimestamp(item.updatedAtOffsetHours)
    }))
  }
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

export async function dashboardHome(_parent: unknown, _args: unknown, context: GraphQLContext) {
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

      db.select().from(adminNotifications).orderBy(desc(adminNotifications.createdAt)).limit(8)
    ])

  const realInboxUnread = Number(unreadRows[0]?.count || 0)
  const realNeedsReply = Number(needsReplyRows[0]?.count || 0)
  const realLeads = Number(leadRows[0]?.count || 0)

  const hasInboxData = inboxPreviewRows.length > 0
  const inboxUnread = hasInboxData ? realInboxUnread : 2
  const needsReply = hasInboxData ? realNeedsReply : 4
  const leads = hasInboxData ? realLeads : 3
  const audienceTrend = createDemoAudienceTrend()
  const visits = audienceTrend.reduce((sum, point) => sum + point.visitors, 0)
  const pageViews = audienceTrend.reduce((sum, point) => sum + point.pageViews, 0)

  const inboxPreview = hasInboxData
    ? inboxPreviewRows.map(normalizeInboxPreviewMessage)
    : createDemoInboxPreview()

  const recentActivity = [
    ...(hasInboxData
      ? inboxPreviewRows.map((message) => ({
          id: `inbox:${message.id}`,
          type: 'inbox',
          title: message.subject || 'New inbox message',
          description: `${message.senderName || 'Someone'} sent a message`,
          createdAt: toTimestamp(message.createdAt),
          href: `/dashboard/inbox?message=${message.id}`
        }))
      : inboxPreview.map((message) => ({
          id: `inbox:${message.id}`,
          type: 'inbox',
          title: message.subject,
          description: `${message.senderName} sent a message`,
          createdAt: message.createdAt,
          href: `/dashboard/inbox?message=${message.id}`
        }))),
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
      visits,
      pageViews,
      searchClicks: 37,
      avgLoadMs: 412
    },

    audienceTrend,

    inboxPreview,

    contentPulse: createDemoContentPulse(),

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
        label: 'Search pull',
        value: '37',
        helper: 'Demo search clicks across current content',
        icon: 'i-lucide-search'
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
        status: 'ok',
        helper: 'Demo analytics are served by the GraphQL resolver'
      },
      {
        key: 'content',
        label: 'Content',
        status: 'ok',
        helper: 'Demo content pulse is available'
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
