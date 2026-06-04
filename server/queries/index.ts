import { analyticsDashboard } from './analytics-dashboard'
import { dashboardHome } from './dashboard-home'
import { inboxFieldResolvers, inboxQueries } from './inbox'
import { inboxWorkspaceQueries } from './inbox-workspace'
import { leadWorkspaceQueries } from './lead-workspace'
import { me } from './me'
import { profileQueries } from './profile'

export const Query = {
  me,
  dashboardHome,
  analyticsDashboard,
  ...inboxQueries,
  ...inboxWorkspaceQueries,
  ...leadWorkspaceQueries,
  ...profileQueries
}

export const fieldResolvers = {
  ...inboxFieldResolvers
}
