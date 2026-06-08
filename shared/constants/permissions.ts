export type UserRole = 'OWNER' | 'MEMBER' | 'GUEST'

export type Permission =
  | 'dashboard:view'
  | 'leads:manage'
  | 'inbox:manage'
  | 'newsletter:manage'
  | 'comments:create'
  | 'comments:moderate'
  | 'chat:access'
  | 'profile:view'
  | 'profile:update'

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  OWNER: [
    'dashboard:view',
    'leads:manage',
    'inbox:manage',
    'newsletter:manage',
    'comments:create',
    'comments:moderate',
    'chat:access',
    'profile:view',
    'profile:update'
  ],

  MEMBER: ['comments:create', 'chat:access', 'profile:view', 'profile:update'],

  GUEST: []
}

export const canRole = (role: UserRole | null | undefined, permission: Permission) => {
  return ROLE_PERMISSIONS[role ?? 'GUEST'].includes(permission)
}
