import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const userRoles = ['ADMIN', 'USER'] as const
export type UserRole = (typeof userRoles)[number]

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  role: text('role', { enum: userRoles }).notNull().default('USER'),
  passwordHash: text('password_hash').notNull(),
  passwordSalt: text('password_salt').notNull(),
  passwordIterations: integer('password_iterations').notNull().default(210000),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
