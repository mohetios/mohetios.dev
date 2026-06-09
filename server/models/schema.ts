import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  role: text('role', { enum: ['OWNER', 'MEMBER'] })
    .notNull()
    .default('MEMBER'),
  displayName: text('display_name'),
  bio: text('bio'),
  website: text('website'),
  avatarUrl: text('avatar_url'),
  passwordHash: text('password_hash').notNull(),
  passwordSalt: text('password_salt').notNull(),
  passwordIterations: integer('password_iterations').notNull().default(210000),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export const inboxMessages = sqliteTable('inbox_messages', {
  id: text('id').primaryKey(),
  source: text('source', { enum: ['CONTACT_FORM', 'EMAIL'] }).notNull(),
  status: text('status', { enum: ['NEW', 'OPEN', 'REPLIED', 'ARCHIVED', 'SPAM'] })
    .notNull()
    .default('NEW'),
  kind: text('kind', {
    enum: ['LEAD', 'COLLABORATION', 'PERSONAL', 'SUPPORT', 'OTHER', 'SPAM']
  })
    .notNull()
    .default('OTHER'),
  priority: text('priority', { enum: ['LOW', 'NORMAL', 'HIGH'] })
    .notNull()
    .default('NORMAL'),
  senderName: text('sender_name').notNull(),
  senderEmail: text('sender_email').notNull(),
  senderCompany: text('sender_company'),
  senderWebsite: text('sender_website'),
  subject: text('subject').notNull(),
  bodyText: text('body_text').notNull(),
  bodyHtml: text('body_html'),
  rawMessageId: text('raw_message_id'),
  inReplyTo: text('in_reply_to'),
  threadKey: text('thread_key').notNull(),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  lastActivityAt: integer('last_activity_at').notNull(),
  trashedAt: integer('trashed_at'),
  leadStatus: text('lead_status', {
    enum: ['NEW', 'QUALIFIED', 'FOLLOW_UP', 'WON', 'LOST', 'ARCHIVED']
  }),
  leadPriority: text('lead_priority', { enum: ['LOW', 'MEDIUM', 'HIGH'] }),
  leadNextFollowUpAt: integer('lead_next_follow_up_at'),
  leadNotes: text('lead_notes'),
  leadEstimatedValue: integer('lead_estimated_value')
})

export type InboxMessage = typeof inboxMessages.$inferSelect
export type NewInboxMessage = typeof inboxMessages.$inferInsert

export const inboxReplies = sqliteTable('inbox_replies', {
  id: text('id').primaryKey(),
  inboxMessageId: text('inbox_message_id')
    .notNull()
    .references(() => inboxMessages.id, { onDelete: 'cascade' }),
  fromEmail: text('from_email').notNull(),
  toEmail: text('to_email').notNull(),
  subject: text('subject').notNull(),
  bodyText: text('body_text').notNull(),
  providerMessageId: text('provider_message_id'),
  status: text('status', { enum: ['DRAFT', 'QUEUED', 'SENT', 'FAILED'] })
    .notNull()
    .default('DRAFT'),
  error: text('error'),
  createdAt: integer('created_at').notNull(),
  sentAt: integer('sent_at')
})

export type InboxReply = typeof inboxReplies.$inferSelect
export type NewInboxReply = typeof inboxReplies.$inferInsert

export const adminNotifications = sqliteTable('admin_notifications', {
  id: text('id').primaryKey(),
  type: text('type', {
    enum: ['NEW_INBOUND_EMAIL', 'NEW_CONTACT_MESSAGE', 'NEW_COMMENT']
  }).notNull(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  url: text('url').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  readAt: integer('read_at'),
  createdAt: integer('created_at').notNull()
})

export type AdminNotification = typeof adminNotifications.$inferSelect
export type NewAdminNotification = typeof adminNotifications.$inferInsert

export const pushSubscriptions = sqliteTable(
  'push_subscriptions',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    endpoint: text('endpoint').notNull(),
    p256dh: text('p256dh').notNull(),
    auth: text('auth').notNull(),
    userAgent: text('user_agent'),
    deviceLabel: text('device_label'),
    createdAt: integer('created_at').notNull(),
    lastUsedAt: integer('last_used_at'),
    disabledAt: integer('disabled_at')
  },
  (table) => [uniqueIndex('push_subscriptions_endpoint_idx').on(table.endpoint)]
)

export type PushSubscription = typeof pushSubscriptions.$inferSelect
export type NewPushSubscription = typeof pushSubscriptions.$inferInsert

export const newsletterSubscribers = sqliteTable(
  'newsletter_subscribers',
  {
    id: text('id').primaryKey(),
    email: text('email').notNull(),
    normalizedEmail: text('normalized_email').notNull(),
    name: text('name'),
    status: text('status', {
      enum: ['pending', 'subscribed', 'unsubscribed', 'bounced', 'complained']
    })
      .notNull()
      .default('subscribed'),
    source: text('source'),
    locale: text('locale'),
    tags: text('tags'),
    consentText: text('consent_text').notNull(),
    consentVersion: text('consent_version').notNull().default('newsletter-consent-v1'),
    consentAt: integer('consent_at').notNull(),
    confirmedAt: integer('confirmed_at'),
    unsubscribedAt: integer('unsubscribed_at'),
    lastEmailSentAt: integer('last_email_sent_at'),
    lastOpenedAt: integer('last_opened_at'),
    lastClickedAt: integer('last_clicked_at'),
    unsubscribeTokenHash: text('unsubscribe_token_hash'),
    ipHash: text('ip_hash'),
    userAgentHash: text('user_agent_hash'),
    turnstileVerifiedAt: integer('turnstile_verified_at'),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull()
  },
  (table) => [
    uniqueIndex('newsletter_subscribers_email_idx').on(table.email),
    uniqueIndex('newsletter_subscribers_normalized_email_idx').on(table.normalizedEmail),
    index('newsletter_subscribers_status_idx').on(table.status),
    index('newsletter_subscribers_created_at_idx').on(table.createdAt)
  ]
)

export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect
export type NewNewsletterSubscriber = typeof newsletterSubscribers.$inferInsert

export const comments = sqliteTable(
  'comments',
  {
    id: text('id').primaryKey(),
    targetType: text('target_type', { enum: ['BLOG_POST'] }).notNull(),
    targetPath: text('target_path').notNull(),
    targetTitle: text('target_title').notNull(),
    parentId: text('parent_id'),
    depth: integer('depth').notNull().default(0),
    authorName: text('author_name').notNull(),
    authorEmail: text('author_email').notNull(),
    authorEmailHash: text('author_email_hash').notNull(),
    authorUserId: text('author_user_id'),
    bodyOriginal: text('body_original').notNull(),
    body: text('body').notNull(),
    status: text('status', { enum: ['PENDING', 'APPROVED', 'SPAM', 'DELETED'] })
      .notNull()
      .default('PENDING'),
    statusReason: text('status_reason'),
    ipHash: text('ip_hash'),
    userAgentHash: text('user_agent_hash'),
    approvedAt: integer('approved_at'),
    approvedBy: text('approved_by'),
    spammedAt: integer('spammed_at'),
    spammedBy: text('spammed_by'),
    deletedAt: integer('deleted_at'),
    deletedBy: text('deleted_by'),
    editedAt: integer('edited_at'),
    editedBy: text('edited_by'),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull()
  },
  (table) => [
    index('comments_target_public_idx').on(
      table.targetType,
      table.targetPath,
      table.status,
      table.createdAt
    ),
    index('comments_admin_status_idx').on(table.status, table.createdAt),
    index('comments_parent_idx').on(table.parentId),
    index('comments_email_hash_idx').on(table.authorEmailHash)
  ]
)

export type Comment = typeof comments.$inferSelect
export type NewComment = typeof comments.$inferInsert
