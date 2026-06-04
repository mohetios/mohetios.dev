import { analyticsDashboard } from './analytics-dashboard'
import { dashboardHome } from './dashboard-home'
import { inboxFieldResolvers, inboxQueries } from './inbox'
import { inboxWorkspaceQueries } from './inbox-workspace'
import { me } from './me'
import { profileQueries } from './profile'

export const Query = {
  me,
  dashboardHome,
  analyticsDashboard,
  ...inboxQueries,
  ...inboxWorkspaceQueries,
  ...profileQueries
}

export const fieldResolvers = {
  ...inboxFieldResolvers
}
