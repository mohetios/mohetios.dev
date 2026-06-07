import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

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
  trashedAt: integer('trashed_at')
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
  type: text('type', { enum: ['NEW_INBOUND_EMAIL', 'NEW_CONTACT_MESSAGE'] }).notNull(),
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
