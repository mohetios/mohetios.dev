export const localeDefinitions = [
  {
    code: 'fa',
    name: 'فارسی',
    file: 'fa.json',
    dir: 'rtl',
    language: 'fa-IR',
    calendar: 'persian',
    uiLocale: 'fa_ir'
  },
  {
    code: 'en',
    name: 'English',
    file: 'en.json',
    dir: 'ltr',
    language: 'en-US',
    calendar: 'gregory',
    uiLocale: 'en'
  }
] as const

export type SupportedLocale = (typeof localeDefinitions)[number]['code']

export const defaultLocale = 'fa' satisfies SupportedLocale

export const supportedLocales = localeDefinitions.map(({ code }) => code)

export function getLocaleDefinition(code: string) {
  return localeDefinitions.find((definition) => definition.code === code) ?? localeDefinitions[0]
}

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
