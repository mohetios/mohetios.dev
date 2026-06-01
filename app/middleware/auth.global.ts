export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) {
    return
  }

  const localePath = useLocalePath()
  const auth = useAuth()
  const pathWithoutLocale = to.path.replace(/^\/(en|fa)(?=\/|$)/, '') || '/'
  const isAuthRoute =
    pathWithoutLocale === '/login' ||
    pathWithoutLocale === '/register' ||
    pathWithoutLocale === '/reset-password'

  if (!isAuthRoute) {
    return
  }

  auth.restoreToken()

  if (auth.token.value) {
    try {
      const user = auth.user.value || (await auth.fetchMe())

      if (user) {
        return navigateTo(localePath('/dashboard'))
      }
    } catch {
      auth.clearToken()
    }
  }
})
