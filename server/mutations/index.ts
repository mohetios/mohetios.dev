import { inboxMutations } from './inbox'
import { leadMutations } from './leads'
import { login } from './login'
import { logout } from './logout'
import { register } from './register'
import { subscribeToNewsletter } from './subscribeToNewsletter'
import { commentMutations } from './comments'

export const Mutation = {
  login,
  register,
  logout,
  subscribeToNewsletter,
  ...inboxMutations,
  ...leadMutations,
  ...commentMutations
}
