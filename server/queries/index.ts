import { dashboardHome } from './dashboard-home'
import { inboxFieldResolvers, inboxQueries } from './inbox'
import { me } from './me'
import { profileQueries } from './profile'

export const Query = {
  me,
  dashboardHome,
  ...inboxQueries,
  ...profileQueries
}

export const fieldResolvers = {
  ...inboxFieldResolvers
}
