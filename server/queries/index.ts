import { analyticsDashboard } from './analytics-dashboard'
import { dashboardHome } from './dashboard-home'
import { inboxFieldResolvers, inboxQueries } from './inbox'
import { inboxWorkspaceQueries } from './inbox-workspace'
import { leadsWorkspaceQueries } from './lead-workspace'
import { me } from './me'
import { newsletterSubscribersQuery } from './newsletter-subscribers'
import { profileQueries } from './profile'

export const Query = {
  me,
  dashboardHome,
  analyticsDashboard,
  newsletterSubscribers: newsletterSubscribersQuery,
  ...inboxQueries,
  ...inboxWorkspaceQueries,
  ...leadsWorkspaceQueries,
  ...profileQueries
}

export const fieldResolvers = {
  ...inboxFieldResolvers
}
