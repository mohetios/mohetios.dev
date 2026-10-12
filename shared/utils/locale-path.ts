import { supportedLocales } from '../constants/locales'

/** `/blog` -> `/fa/blog`; the root becomes `/fa`. */
export function withLocale(path: string, locale: string) {
  return path === '/' ? `/${locale}` : `/${locale}${path}`
}

/** `/fa/blog/x` -> `/blog/x`; `/fa` -> `/`. */
export function stripLocalePrefix(path: string) {
  const [, first, ...rest] = path.split('/')

  return (supportedLocales as readonly string[]).includes(first ?? '')
    ? `/${rest.join('/')}`.replace(/\/$/, '') || '/'
    : path
}
