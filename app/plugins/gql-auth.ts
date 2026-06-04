import { GRAPHQL_ENDPOINT } from '~~/shared/constants/routes'

const tokenCookieKey = 'mohetios_auth_token'

export default defineNuxtPlugin((nuxtApp) => {
  const graphqlHost = import.meta.client
    ? new URL(GRAPHQL_ENDPOINT, window.location.origin).toString()
    : new URL(GRAPHQL_ENDPOINT, useRequestURL().origin).toString()

  useGqlHost(graphqlHost, 'default')

  const tokenCookie = useCookie<string | null>(tokenCookieKey, {
    path: '/',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    secure: import.meta.env.PROD
  })

  nuxtApp.hook('gql:auth:init', ({ client, token }) => {
    if (client !== 'default') return

    token.value = tokenCookie.value || undefined
  })

  if (tokenCookie.value) {
    useGqlToken(tokenCookie.value)
  }
})
