import { inboxMutations } from './inbox'
import { login } from './login'
import { logout } from './logout'
import { profileMutations } from './profile'
import { register } from './register'

export const Mutation = {
  login,
  register,
  logout,
  ...inboxMutations,
  ...profileMutations
}
