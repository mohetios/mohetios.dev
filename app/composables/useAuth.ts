import { canRole, type Permission } from '~~/shared/constants/permissions'
import type { AuthInput } from '~~/shared/schemas/auth.schema'
import type { AuthUser } from '~~/shared/types/auth'

const tokenCookieKey = 'mohetios_auth_token'
const graphqlEndpoint = '/graph'

type AuthPayload = {
  token: string
  user: AuthUser
}

type GraphqlResponse<T> = {
  data?: T
  errors?: Array<{ message?: string }>
}

type GraphqlClientError = {
  statusCode?: number
  gqlErrors?: Array<{ message?: string }>
  message?: string
  response?: {
    status?: number
    errors?: Array<{ message?: string }>
    message?: string
  }
}

function getGraphqlErrorMessage(error: unknown) {
  if (!error || typeof error !== 'object') {
    return 'Authentication request failed'
  }

  const graphqlError = error as GraphqlClientError
  const message =
    graphqlError.gqlErrors?.[0]?.message ||
    graphqlError.response?.errors?.[0]?.message ||
    graphqlError.response?.message ||
    graphqlError.message

  if (message) {
    return message
  }

  const statusCode = graphqlError.statusCode || graphqlError.response?.status

  return statusCode
    ? `Authentication request failed with HTTP ${statusCode}`
    : 'Authentication request failed'
}

async function requestGraphql<T>(
  query: string,
  variables: Record<string, unknown> = {},
  token?: string | null
) {
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
    throw new Error(response.errors[0]?.message || 'GraphQL request failed')
  }

  if (!response.data) {
    throw new Error('GraphQL request failed')
  }

  return response.data
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
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7
  })

  const user = useState<AuthUser | null>('auth:user', () => null)

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
    useGqlToken(null)
  }

  function restoreToken() {
    if (token.value) {
      useGqlToken(token.value)
    }

    return token.value
  }

  async function fetchMe() {
    const currentToken = restoreToken()

    if (!currentToken) {
      user.value = null

      return null
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

      if (!data.me) {
        clearSession()
      }

      return data.me
    } catch (error) {
      clearSession()
      throw new Error(getGraphqlErrorMessage(error))
    }
  }

  async function login(input: AuthInput) {
    try {
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

      return data.login
    } catch (error) {
      throw new Error(getGraphqlErrorMessage(error))
    }
  }

  async function register(input: AuthInput) {
    try {
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

      return data.register
    } catch (error) {
      throw new Error(getGraphqlErrorMessage(error))
    }
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
