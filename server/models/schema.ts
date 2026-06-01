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
