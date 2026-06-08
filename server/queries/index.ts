import { authSetupAvailable } from './auth-setup'
import { analyticsDashboard } from './analytics-dashboard'
import { dashboardHome } from './dashboard-home'
import { inboxFieldResolvers } from './inbox'
import { inboxWorkspaceQueries } from './inbox-workspace'
import { leadsWorkspaceQueries } from './lead-workspace'
import { me } from './me'
import { newsletterSubscribersQuery } from './newsletter-subscribers'
export const Query = {
  authSetupAvailable,
  me,
  dashboardHome,
  analyticsDashboard,
  newsletterSubscribers: newsletterSubscribersQuery,
  ...inboxWorkspaceQueries,
  ...leadsWorkspaceQueries
}

export const fieldResolvers = {
  ...inboxFieldResolvers
}
