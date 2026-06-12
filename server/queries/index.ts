import { authSetupAvailable } from './auth-setup'
import { analyticsDashboard } from './analytics-dashboard'
import { dashboardHome } from './dashboard-home'
import { dashboardNavCounts } from './dashboard-nav-counts'
import { inboxFieldResolvers } from './inbox'
import { inboxWorkspaceQueries } from './inbox-workspace'
import { leadsWorkspaceQueries } from './lead-workspace'
import { me } from './me'
import { newsletterSubscribersQuery } from './newsletter-subscribers'
import { adminComments, publicComments } from './public-comments'
export const Query = {
  authSetupAvailable,
  me,
  dashboardHome,
  dashboardNavCounts,
  analyticsDashboard,
  newsletterSubscribers: newsletterSubscribersQuery,
  publicComments,
  adminComments,
  ...inboxWorkspaceQueries,
  ...leadsWorkspaceQueries
}

export const fieldResolvers = {
  ...inboxFieldResolvers
}
