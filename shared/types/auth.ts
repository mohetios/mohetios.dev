import type { UserRole } from '../constants/permissions'

export type AuthUser = {
  id: string
  username: string
  displayName?: string | null
  bio?: string | null
  website?: string | null
  avatarUrl?: string | null
  role: Exclude<UserRole, 'GUEST'>
  createdAt: string
}

export type LoginInput = {
  username: string
  password: string
}

export type RegisterInput = {
  username: string
  password: string
  displayName?: string
}

export type UpdateProfileInput = {
  displayName?: string | null
  bio?: string | null
  website?: string | null
  avatarUrl?: string | null
}
