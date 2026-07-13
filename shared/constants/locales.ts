export const localeDefinitions = [
  {
    code: 'fa',
    name: 'فارسی',
    file: 'fa.json',
    dir: 'rtl',
    language: 'fa-IR',
    calendar: 'persian',
    uiLocale: 'fa_ir',
    switchLabelKey: 'actions.switchToPersian'
  },
  {
    code: 'en',
    name: 'English',
    file: 'en.json',
    dir: 'ltr',
    language: 'en-US',
    calendar: 'gregory',
    uiLocale: 'en',
    switchLabelKey: 'actions.switchToEnglish'
  }
] as const

export type SupportedLocale = (typeof localeDefinitions)[number]['code']

export const defaultLocale = 'fa' satisfies SupportedLocale

export const supportedLocales = localeDefinitions.map(({ code }) => code)
