import { getRequestURL, sendRedirect } from 'h3'

import { defaultLocale, supportedLocales } from '../../shared/constants/locales'

const appRouteSections = new Set([
  'about',
  'blog',
  'contact',
  'dashboard',
  'lab',
  'login',
  'member',
  'projects',
  'register',
  'reset-password',
  'tags'
])

export default defineEventHandler((event) => {
  const url = getRequestURL(event)
  const path = url.pathname
  const firstSegment = path.split('/').filter(Boolean)[0]

  if (!firstSegment || supportedLocales.includes(firstSegment as typeof supportedLocales[number])) {
    return
  }

  if (!appRouteSections.has(firstSegment)) {
    return
  }

  return sendRedirect(event, `/${defaultLocale}${path}${url.search}`, 302)
})
