import type { Permission } from '~~/shared/constants/permissions'
import { isAuthError } from '~/utils/graphql-error'

export default defineNuxtRouteMiddleware(async (to) => {
  const localePath = useLocalePath()
  const auth = useAuth()
  const loginPath = localePath('/login')

  const pathWithoutLocale = stripLocalePrefix(to.path)

  const isDashboardRoute =
    pathWithoutLocale === '/dashboard' || pathWithoutLocale.startsWith('/dashboard/')

  const isMemberRoute = pathWithoutLocale === '/member' || pathWithoutLocale.startsWith('/member/')

  const isAuthRoute = pathWithoutLocale === '/login'

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
      return navigateTo({
        path: loginPath,
        query: {
          redirect: to.fullPath
        }
      })
    }

    return
  }

  try {
    const user = auth.user.value || (await auth.fetchMe())

    if (user && isAuthRoute) {
      return navigateTo(
        user.role === 'OWNER' ? localePath('/dashboard') : localePath('/member/profile')
      )
    }

    if (!user && needsAuth) {
      return navigateTo({
        path: loginPath,
        query: {
          redirect: to.fullPath
        }
      })
    }

    if (user && requiredPermission && !auth.can(requiredPermission)) {
      return navigateTo(
        user.role === 'OWNER' ? localePath('/dashboard') : localePath('/member/profile')
      )
    }
  } catch (error) {
    if (isAuthError(error)) {
      auth.clearSession()

      if (needsAuth) {
        return navigateTo({
          path: loginPath,
          query: {
            redirect: to.fullPath
          }
        })
      }

      return
    }

    // Keep the cookie/token on temporary server, GraphQL, or network failures.
    // The protected page may show its own error state, but the user is not logged out.
    return
  }
})
