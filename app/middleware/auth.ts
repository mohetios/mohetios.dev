import type { Permission } from '~~/shared/constants/permissions'

type AuthFetchError = {
  status?: number
  statusCode?: number
  response?: {
    status?: number
  }
  data?: {
    status?: number
    statusCode?: number
  }
  message?: string
}

function getErrorStatus(error: unknown) {
  if (!error || typeof error !== 'object') return null

  const currentError = error as AuthFetchError

  return (
    currentError.status ||
    currentError.statusCode ||
    currentError.response?.status ||
    currentError.data?.status ||
    currentError.data?.statusCode ||
    null
  )
}

function isAuthError(error: unknown) {
  const status = getErrorStatus(error)

  return status === 401 || status === 403
}

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

  auth.restoreToken()

  if (!auth.token.value) {
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
    }

    // Important:
    // Do not clear session for temporary API/network/server errors.
    // Keep the token so a page reload or transient fetchMe failure does not log the user out.
    return
  }
})
