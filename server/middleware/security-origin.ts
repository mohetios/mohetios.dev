import { assertSameOriginIfAuthenticated } from '../utils/security'

const protectedPathPrefixes = ['/graph', '/api/push/']

export default defineEventHandler((event) => {
  const path = event.path?.split('?')[0] ?? ''

  if (!protectedPathPrefixes.some((prefix) => path === prefix || path.startsWith(prefix))) {
    return
  }

  assertSameOriginIfAuthenticated(event)
})
