import type { LoginInput, MeQuery, RegisterInput } from '#gql'
import { canRole, type Permission } from '~~/shared/constants/permissions'
import { getGraphqlErrorMessage, isAuthError } from '~/utils/graphql-error'

const tokenCookieKey = 'mohetios_auth_token'

type AuthUser = NonNullable<MeQuery['me']>

function normalizeAuthRequestError(error: unknown, fallback?: string) {
  if (error instanceof Error) return error

  return new Error(getGraphqlErrorMessage(error, fallback))
}

async function runAuthRequest<T>(fn: () => Promise<T>, fallback?: string) {
  try {
    return await fn()
  } catch (error) {
    throw normalizeAuthRequestError(error, fallback)
  }
}

export function useAuth() {
  const token = useCookie<string | null>(tokenCookieKey, {
    path: '/',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    secure: import.meta.env.PROD
  })

  const user = useState<AuthUser | null>('auth:user', () => null)
  const meLoaded = useState<boolean>('auth:me-loaded', () => false)
  const isFetchingMe = useState<boolean>('auth:is-fetching-me', () => false)

  const role = computed(() => user.value?.role ?? 'GUEST')
  const isOwner = computed(() => user.value?.role === 'OWNER')
  const isMember = computed(() => user.value?.role === 'MEMBER')
  const isAuthenticated = computed(() => Boolean(token.value && user.value))

  function can(permission: Permission) {
    return canRole(user.value?.role, permission)
  }

  function setToken(value: string) {
    token.value = value
    useGqlToken(value)
  }

  function clearSession() {
    token.value = null
    user.value = null
    meLoaded.value = false
    isFetchingMe.value = false
    useGqlToken(null)
  }

  function restoreToken() {
    if (token.value) {
      useGqlToken(token.value)
    } else {
      useGqlToken(null)
    }

    return token.value
  }

  async function fetchMe(options: { force?: boolean } = {}) {
    const currentToken = restoreToken()

    if (!currentToken) {
      user.value = null
      meLoaded.value = true

      return null
    }

    if (!options.force && meLoaded.value) {
      return user.value
    }

    if (isFetchingMe.value) {
      return user.value
    }

    isFetchingMe.value = true

    try {
      const data = await runAuthRequest(() => GqlMe(), 'Session request failed')

      user.value = data.me ?? null
      meLoaded.value = true

      if (!data.me) {
        clearSession()
      }

      return data.me ?? null
    } catch (error) {
      meLoaded.value = false

      if (isAuthError(error)) {
        clearSession()
      }

      throw error
    } finally {
      isFetchingMe.value = false
    }
  }

  async function login(input: LoginInput) {
    const data = await runAuthRequest(() => GqlLogin({ input }), 'Login request failed')

    setToken(data.login.token)
    user.value = data.login.user
    meLoaded.value = true

    return data.login
  }

  async function register(input: RegisterInput) {
    const data = await runAuthRequest(() => GqlRegister({ input }), 'Registration request failed')

    setToken(data.register.token)
    user.value = data.register.user
    meLoaded.value = true

    return data.register
  }

  async function logout() {
    restoreToken()

    if (token.value) {
      await GqlLogout().catch(() => undefined)
    }

    clearSession()
  }

  return {
    token,
    user,
    meLoaded,
    role,
    isOwner,
    isMember,
    isAuthenticated,
    can,
    setToken,
    clearToken: clearSession,
    clearSession,
    restoreToken,
    fetchMe,
    login,
    register,
    logout
  }
}
