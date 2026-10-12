export const GRAPHQL_ENDPOINT = '/graph'

// First path segments that exist only under a locale prefix; unprefixed requests are redirected.
export const LOCALIZED_ROUTE_SECTIONS = [
  'about',
  'blog',
  'contact',
  'dashboard',
  'lab',
  'login',
  'member',
  'projects',
  'register',
  'reset-password',
  'tags'
] as const
