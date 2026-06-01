import { eq } from 'drizzle-orm'

import { users, type NewUser } from './schema'
import type { Db } from './client'

export async function findUserByEmail(db: Db, email: string) {
  return db.query.users.findFirst({
    where: eq(users.email, email)
  })
}

export async function findUserById(db: Db, id: string) {
  return db.query.users.findFirst({
    where: eq(users.id, id)
  })
}

export async function hasAnyUser(db: Db) {
  const existing = await db.select({ id: users.id }).from(users).limit(1)

  return existing.length > 0
}

export async function createUser(db: Db, data: NewUser) {
  const [user] = await db.insert(users).values(data).returning()

  return user
}
