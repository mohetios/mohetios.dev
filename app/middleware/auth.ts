import { isAuthError } from '~/composables/useAuth'
import type { Permission } from '~~/shared/constants/permissions'

function stripLocale(path: string) {
  return path.replace(/^\/(en|fa)(?=\/|$)/, '') || '/'
}

export default defineNuxtRouteMiddleware(async (to) => {
  const localePath = useLocalePath()
  const auth = useAuth()

  const pathWithoutLocale = stripLocale(to.path)

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

  const needsAuth = isDashboardRoute || isMemberRoute || Boolean(requiredPermission)

  if (!needsAuth && !isAuthRoute) {
    return
  }

  const token = auth.restoreToken()

  if (!token) {
    if (needsAuth) {
      return navigateTo(localePath('/login'))
    }

    return
  }

  try {
    const user = auth.user.value || (await auth.fetchMe())

    if (user && isAuthRoute) {
      return navigateTo(localePath(user.role === 'OWNER' ? '/dashboard' : '/member/profile'))
    }

    if (!user && needsAuth) {
      return navigateTo(localePath('/login'))
    }

    if (user && requiredPermission && !auth.can(requiredPermission)) {
      return navigateTo(localePath(user.role === 'OWNER' ? '/dashboard' : '/member/profile'))
    }
  } catch (error) {
    if (import.meta.dev) {
      console.error('[auth middleware]', error)
    }

    if (isAuthError(error)) {
      auth.clearSession()

      if (needsAuth) {
        return navigateTo(localePath('/login'))
      }

      return
    }

    // Keep the cookie/token on temporary server, GraphQL, or network failures.
    // The protected page may show its own error state, but the user is not logged out.
    return
  }
})
