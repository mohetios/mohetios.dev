export type UserRole = 'ADMIN' | 'USER'

export type AuthUser = {
  id: string
  username: string
  role: UserRole
  createdAt: string
}
