export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) {
    return
  }

  const localePath = useLocalePath()
  const auth = useAuth()

  auth.restoreToken()

  if (!auth.token.value) {
    return navigateTo(localePath('/login'))
  }

  try {
    const user = auth.user.value || (await auth.fetchMe())

    if (!user) {
      return navigateTo(localePath('/login'))
    }
  } catch {
    auth.clearToken()

    return navigateTo(localePath('/login'))
  }
})
