import { me } from './me'
import { profileQueries } from './profile'

export const Query = {
  me,
  ...profileQueries
}
