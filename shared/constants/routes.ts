export const GRAPHQL_ENDPOINT = '/graph'

export const publicRoutes = {
  home: '/',
  login: '/login',
  register: '/register'
} as const

export const dashboardRoutes = {
  overview: '/dashboard',
  inbox: '/dashboard/inbox',
  leads: '/dashboard/leads',
  comments: '/dashboard/comments',
  forms: '/dashboard/forms',
  analytics: '/dashboard/analytics'
} as const
