import { authLogin } from './authLogin'
import { authLogout } from './authLogout'
import { authRegister } from './authRegister'

export const mutations = {
  login: authLogin,
  logout: authLogout,
  register: authRegister
}
