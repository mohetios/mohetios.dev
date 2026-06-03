import { canRole, type Permission } from '~~/shared/constants/permissions'
import type { AuthInput } from '~~/shared/schemas/auth.schema'
import type { AuthUser } from '~~/shared/types/auth'

const tokenCookieKey = 'mohetios_auth_token'
const graphqlEndpoint = '/graph'

type AuthPayload = {
  token: string
  user: AuthUser
}

type GraphqlError = {
  message?: string
  extensions?: {
    code?: string
    statusCode?: number
    status?: number
    http?: {
      status?: number
    }
  }
}

type GraphqlResponse<T> = {
  data?: T
  errors?: GraphqlError[]
}

type AuthRequestError = Error & {
  statusCode?: number
  gqlCode?: string
}

type FetchLikeError = {
  status?: number
  statusCode?: number
  response?: {
    status?: number
    _data?: {
      errors?: GraphqlError[]
      message?: string
    }
  }
  data?: {
    status?: number
    statusCode?: number
    errors?: GraphqlError[]
    message?: string
  }
  message?: string
}

function getErrorStatus(error: unknown) {
  if (!error || typeof error !== 'object') return null

  const currentError = error as FetchLikeError

  return (
    currentError.status ||
    currentError.statusCode ||
    currentError.response?.status ||
    currentError.data?.status ||
    currentError.data?.statusCode ||
    null
  )
}

function getGraphqlStatus(error?: GraphqlError) {
  const code = error?.extensions?.code

  if (code === 'UNAUTHENTICATED') return 401
  if (code === 'FORBIDDEN') return 403

  return (
    error?.extensions?.http?.status ||
    error?.extensions?.status ||
    error?.extensions?.statusCode ||
    null
  )
}

function isAuthStatus(status: number | null) {
  return status === 401 || status === 403
}

export function isAuthError(error: unknown) {
  const status = getErrorStatus(error)

  if (isAuthStatus(status)) return true

  if (error && typeof error === 'object') {
    const gqlCode = (error as AuthRequestError).gqlCode

    return gqlCode === 'UNAUTHENTICATED' || gqlCode === 'FORBIDDEN'
  }

  return false
}

function createAuthRequestError(message: string, statusCode?: number | null, gqlCode?: string): AuthRequestError {
  const error = new Error(message) as AuthRequestError

  if (statusCode) {
    error.statusCode = statusCode
  }

  if (gqlCode) {
    error.gqlCode = gqlCode
  }

  return error
}

function getGraphqlErrorMessage(error: unknown) {
  if (!error || typeof error !== 'object') {
    return 'Authentication request failed'
  }

  const currentError = error as FetchLikeError

  const responseError =
    currentError.response?._data?.errors?.[0] ||
    currentError.data?.errors?.[0]

  return (
    responseError?.message ||
    currentError.response?._data?.message ||
    currentError.data?.message ||
    currentError.message ||
    'Authentication request failed'
  )
}

async function requestGraphql<T>(
  query: string,
  variables: Record<string, unknown> = {},
  token?: string | null
) {
  try {
    const response = await $fetch<GraphqlResponse<T>>(graphqlEndpoint, {
      method: 'POST',
      headers: token
        ? {
            Authorization: `Bearer ${token}`
          }
        : undefined,
      body: {
        query,
        variables
      }
    })

    if (response.errors?.length) {
      const firstError = response.errors[0]
      const statusCode = getGraphqlStatus(firstError)
      const gqlCode = firstError?.extensions?.code

      throw createAuthRequestError(
        firstError?.message || 'GraphQL request failed',
        statusCode,
        gqlCode
      )
    }

    if (!response.data) {
      throw createAuthRequestError('GraphQL request failed')
    }

    return response.data
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }

    const statusCode = getErrorStatus(error)
    const responseError =
      error && typeof error === 'object'
        ? ((error as FetchLikeError).response?._data?.errors?.[0] ||
            (error as FetchLikeError).data?.errors?.[0])
        : undefined

    throw createAuthRequestError(
      getGraphqlErrorMessage(error),
      statusCode,
      responseError?.extensions?.code
    )
  }
}

const authUserFields = `
  id
  username
  role
  displayName
  bio
  website
  avatarUrl
  createdAt
`

export function useAuth() {
  const token = useCookie<string | null>(tokenCookieKey, {
    path: '/',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    secure: import.meta.env.PROD
  })

  const user = useState<AuthUser | null>('auth:user', () => null)
  const meLoaded = useState<boolean>('auth:me-loaded', () => false)

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
    useGqlToken(null)
  }

  function restoreToken() {
    if (token.value) {
      useGqlToken(token.value)
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

    try {
      const data = await requestGraphql<{ me: AuthUser | null }>(
        `
          query Me {
            me {
              ${authUserFields}
            }
          }
        `,
        {},
        currentToken
      )

      user.value = data.me
      meLoaded.value = true

      if (!data.me) {
        clearSession()
      }

      return data.me
    } catch (error) {
      meLoaded.value = false

      // Critical fix:
      // Only clear cookie/session when backend explicitly says auth is invalid.
      // Do NOT clear session for temporary GraphQL/server/network errors.
      if (isAuthError(error)) {
        clearSession()
      }

      throw error
    }
  }

  async function login(input: AuthInput) {
    const data = await requestGraphql<{ login: AuthPayload }>(
      `
        mutation Login($input: LoginInput!) {
          login(input: $input) {
            token
            user {
              ${authUserFields}
            }
          }
        }
      `,
      { input }
    )

    setToken(data.login.token)
    user.value = data.login.user
    meLoaded.value = true

    return data.login
  }

  async function register(input: AuthInput) {
    const data = await requestGraphql<{ register: AuthPayload }>(
      `
        mutation Register($input: RegisterInput!) {
          register(input: $input) {
            token
            user {
              ${authUserFields}
            }
          }
        }
      `,
      { input }
    )

    setToken(data.register.token)
    user.value = data.register.user
    meLoaded.value = true

    return data.register
  }

  async function logout() {
    restoreToken()

    if (token.value) {
      await requestGraphql<{ logout: boolean }>(
        `
          mutation Logout {
            logout
          }
        `,
        {},
        token.value
      ).catch(() => undefined)
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