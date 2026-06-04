import { analyticsDashboard } from './analytics-dashboard'
import { dashboardHome } from './dashboard-home'
import { inboxFieldResolvers, inboxQueries } from './inbox'
import { me } from './me'
import { profileQueries } from './profile'

export const Query = {
  me,
  dashboardHome,
  analyticsDashboard,
  ...inboxQueries,
  ...profileQueries
}

export const fieldResolvers = {
  ...inboxFieldResolvers
}
