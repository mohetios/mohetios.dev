type AuthUser = {
  id: string
  email: string
  name: string | null
  role: 'ADMIN' | 'USER'
  createdAt: string
  updatedAt: string
}

type AuthInput = {
  email: string
  password: string
  name?: string
}

type GraphqlResponse<T> = {
  data?: T
  errors?: Array<{ message: string }>
}

const tokenStorageKey = 'mohetios_auth_token'

const userFields = `
  id
  email
  name
  role
  createdAt
  updatedAt
`

async function requestGraphql<T>(
  query: string,
  variables: Record<string, unknown> = {},
  token?: string | null
) {
  const response = await $fetch<GraphqlResponse<T>>('/api/graphql', {
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

export function useAuth() {
  const token = useState<string | null>('auth:token', () => null)
  const user = useState<AuthUser | null>('auth:user', () => null)
  const isAuthenticated = computed(() => Boolean(token.value && user.value))

  function setToken(value: string) {
    token.value = value

    if (import.meta.client) {
      localStorage.setItem(tokenStorageKey, value)
    }
  }

  function clearToken() {
    token.value = null
    user.value = null

    if (import.meta.client) {
      localStorage.removeItem(tokenStorageKey)
    }
  }

  function restoreToken() {
    if (!import.meta.client || token.value) {
      return token.value
    }

    token.value = localStorage.getItem(tokenStorageKey)

    return token.value
  }

  async function fetchMe() {
    const currentToken = restoreToken()

    if (!currentToken) {
      user.value = null

      return null
    }

    const data = await requestGraphql<{ me: AuthUser | null }>(
      `
        query Me {
          me {
            ${userFields}
          }
        }
      `,
      {},
      currentToken
    )

    user.value = data.me

    if (!data.me) {
      clearToken()
    }

    return data.me
  }

  async function login(input: AuthInput) {
    const data = await requestGraphql<{ login: { token: string; user: AuthUser } }>(
      `
        mutation Login($input: LoginInput!) {
          login(input: $input) {
            token
            user {
              ${userFields}
            }
          }
        }
      `,
      { input }
    )

    setToken(data.login.token)
    user.value = data.login.user

    return data.login
  }

  async function register(input: AuthInput) {
    const data = await requestGraphql<{ register: { token: string; user: AuthUser } }>(
      `
        mutation Register($input: RegisterInput!) {
          register(input: $input) {
            token
            user {
              ${userFields}
            }
          }
        }
      `,
      { input }
    )

    setToken(data.register.token)
    user.value = data.register.user

    return data.register
  }

  async function logout() {
    const currentToken = restoreToken()

    if (currentToken) {
      await requestGraphql<{ logout: boolean }>(
        `
          mutation Logout {
            logout
          }
        `,
        {},
        currentToken
      ).catch(() => undefined)
    }

    clearToken()
  }

  return {
    token,
    user,
    isAuthenticated,
    setToken,
    clearToken,
    restoreToken,
    fetchMe,
    login,
    register,
    logout
  }
}
