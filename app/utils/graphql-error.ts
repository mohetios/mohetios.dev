type GraphqlErrorLike = {
  message?: string
  extensions?: {
    code?: string
    status?: number
    statusCode?: number
    http?: {
      status?: number
    }
  }
}

type ErrorLike = {
  message?: string
  gqlErrors?: GraphqlErrorLike[]
  status?: number
  statusCode?: number
  response?: {
    status?: number
    errors?: GraphqlErrorLike[]
    _data?: {
      errors?: GraphqlErrorLike[]
    }
  }
  data?: {
    status?: number
    statusCode?: number
    errors?: GraphqlErrorLike[]
  }
}

function getErrorMessageValue(value: unknown) {
  if (!value || typeof value !== 'object') return null

  const message = (value as { message?: unknown }).message

  return typeof message === 'string' && message ? message : null
}

function getFirstGraphqlError(error: unknown) {
  if (!error || typeof error !== 'object') return undefined

  const currentError = error as ErrorLike

  return (
    currentError.gqlErrors?.[0] ||
    currentError.response?.errors?.[0] ||
    currentError.response?._data?.errors?.[0] ||
    currentError.data?.errors?.[0]
  )
}

function getGraphqlStatus(error: GraphqlErrorLike | undefined) {
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

function getErrorStatus(error: unknown) {
  if (!error || typeof error !== 'object') return null

  const currentError = error as ErrorLike

  return (
    currentError.status ||
    currentError.statusCode ||
    currentError.response?.status ||
    currentError.data?.status ||
    currentError.data?.statusCode ||
    null
  )
}

export function isAuthError(error: unknown) {
  const gqlError = getFirstGraphqlError(error)
  const status = getGraphqlStatus(gqlError) ?? getErrorStatus(error)
  const code = gqlError?.extensions?.code

  return status === 401 || status === 403 || code === 'UNAUTHENTICATED' || code === 'FORBIDDEN'
}

export function getGraphqlErrorCode(error: unknown) {
  return getFirstGraphqlError(error)?.extensions?.code
}

export function getGraphqlErrorMessage(error: unknown, fallback = 'GraphQL request failed') {
  const gqlError = getFirstGraphqlError(error)

  if (gqlError?.message) return gqlError.message
  if (error instanceof Error && error.message) return error.message

  if (error && typeof error === 'object') {
    const currentError = error as ErrorLike

    if (currentError.message) return currentError.message

    const gqlErrorMessage = Array.isArray(currentError.gqlErrors)
      ? getErrorMessageValue(currentError.gqlErrors[0])
      : null

    if (gqlErrorMessage) return gqlErrorMessage

    const responseMessage = getErrorMessageValue(currentError.response)
    const dataMessage = getErrorMessageValue(currentError.data)

    if (responseMessage) return responseMessage
    if (dataMessage) return dataMessage
  }

  return fallback
}
