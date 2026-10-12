import { inboxMutations } from './inbox'
import { leadMutations } from './leads'
import { login } from './login'
import { logout } from './logout'
import { register } from './register'
import { newsletterIssueMutations } from './newsletter-issues'
import { subscribeToNewsletter } from './subscribeToNewsletter'
import { commentMutations } from './comments'

export const Mutation = {
  login,
  register,
  logout,
  subscribeToNewsletter,
  ...newsletterIssueMutations,
  ...inboxMutations,
  ...leadMutations,
  ...commentMutations
}
