import { inboxFieldResolvers, inboxQueries } from './inbox'
import { me } from './me'
import { profileQueries } from './profile'

export const Query = {
  me,
  ...inboxQueries,
  ...profileQueries
}

export const fieldResolvers = {
  ...inboxFieldResolvers
}
