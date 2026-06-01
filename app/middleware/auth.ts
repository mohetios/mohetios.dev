import type { Permission } from '~~/shared/constants/permissions'

export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) {
    return
  }

  const localePath = useLocalePath()
  const auth = useAuth()
  const pathWithoutLocale = to.path.replace(/^\/(en|fa)(?=\/|$)/, '') || '/'
  const isDashboardRoute =
    pathWithoutLocale === '/dashboard' || pathWithoutLocale.startsWith('/dashboard/')
  const isMemberRoute = pathWithoutLocale === '/member' || pathWithoutLocale.startsWith('/member/')
  const isAuthRoute =
    pathWithoutLocale === '/login' ||
    pathWithoutLocale === '/register' ||
    pathWithoutLocale === '/reset-password'
  const requiredPermission =
    typeof to.meta.requiredPermission === 'string'
      ? (to.meta.requiredPermission as Permission)
      : isDashboardRoute
        ? 'dashboard:view'
        : undefined

  if (!isDashboardRoute && !isMemberRoute && !isAuthRoute && !requiredPermission) {
    return
  }

  auth.restoreToken()

  if (!auth.token.value) {
    if (isDashboardRoute || isMemberRoute || requiredPermission) {
      return navigateTo(localePath('/login'))
    }

    return
  }

  try {
    const user = auth.user.value || (await auth.fetchMe())

    if (user && isAuthRoute) {
      return navigateTo(localePath(user.role === 'OWNER' ? '/dashboard' : '/member/profile'))
    }

    if (!user && (isDashboardRoute || isMemberRoute || requiredPermission)) {
      return navigateTo(localePath('/login'))
    }

    if (user && requiredPermission && !auth.can(requiredPermission)) {
      return navigateTo(localePath(user.role === 'OWNER' ? '/dashboard' : '/member/profile'))
    }
  } catch {
    auth.clearSession()
    // console.log('err')

    if (isDashboardRoute || isMemberRoute || requiredPermission) {
      return navigateTo(localePath('/login'))
    }
  }
})
