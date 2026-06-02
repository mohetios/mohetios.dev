import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

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
  channel: text('channel', { enum: ['CONTACT_FORM', 'EMAIL', 'SYSTEM', 'MANUAL'] }).notNull(),
  status: text('status', { enum: ['UNREAD', 'READ', 'ARCHIVED', 'SPAM'] })
    .notNull()
    .default('UNREAD'),
  category: text('category', { enum: ['LEAD', 'JOB', 'FREELANCE', 'GENERAL', 'SYSTEM'] })
    .notNull()
    .default('GENERAL'),
  fromName: text('from_name').notNull(),
  fromEmail: text('from_email').notNull(),
  subject: text('subject').notNull(),
  preview: text('preview').notNull(),
  body: text('body').notNull(),
  topic: text('topic'),
  company: text('company'),
  website: text('website'),
  source: text('source'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
})

export type InboxMessage = typeof inboxMessages.$inferSelect
export type NewInboxMessage = typeof inboxMessages.$inferInsert
