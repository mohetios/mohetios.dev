export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) {
    return
  }

  const localePath = useLocalePath()
  const auth = useAuth()
  const pathWithoutLocale = to.path.replace(/^\/(en|fa)(?=\/|$)/, '') || '/'
  const isDashboardRoute =
    pathWithoutLocale === '/dashboard' || pathWithoutLocale.startsWith('/dashboard/')
  const isAuthRoute =
    pathWithoutLocale === '/login' ||
    pathWithoutLocale === '/register' ||
    pathWithoutLocale === '/reset-password'

  if (!isDashboardRoute && !isAuthRoute) {
    return
  }

  auth.restoreToken()

  if (!auth.token.value) {
    if (isDashboardRoute) {
      return navigateTo(localePath('/login'))
    }

    return
  }

  try {
    const user = auth.user.value || (await auth.fetchMe())

    if (user && isAuthRoute) {
      return navigateTo(localePath('/dashboard'))
    }

    if (!user && isDashboardRoute) {
      return navigateTo(localePath('/login'))
    }
  } catch {
    auth.clearSession()

    if (isDashboardRoute) {
      return navigateTo(localePath('/login'))
    }
  }
})
