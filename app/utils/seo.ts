export type MaybeString = string | null | undefined

export const DEFAULT_OG_IMAGE_PATH = '/page-images/home.webp'

function isLatinWordmark(value: string) {
  return /^[a-z0-9]+$/i.test(value)
}

export function normalizeSiteUrl(siteUrl: string) {
  return siteUrl.replace(/\/$/, '')
}

export function normalizePath(path: string) {
  if (!path) {
    return '/'
  }

  return path.startsWith('/') ? path : `/${path}`
}

export function buildCanonicalUrl(path: string, siteUrl: string) {
  return `${normalizeSiteUrl(siteUrl)}${normalizePath(path)}`
}

export function resolveAbsoluteUrl(url: MaybeString, siteUrl: string) {
  if (!url) {
    return undefined
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }

  return buildCanonicalUrl(url, siteUrl)
}

export function resolveSeoImageUrl(url: MaybeString, siteUrl: string) {
  return resolveAbsoluteUrl(url, siteUrl) ?? resolveAbsoluteUrl(DEFAULT_OG_IMAGE_PATH, siteUrl)!
}

export function cleanSeoDescription(value?: MaybeString, fallback = '') {
  return String(value || fallback)
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 240)
}

function formatLatinWordmark(wordmark: string) {
  const lower = wordmark.toLowerCase()
  return lower.charAt(0).toUpperCase() + lower.slice(1)
}

/** SEO brand name from i18n logo parts — Latin wordmarks become Mohetios, not mohetios. */
export function getSeoSiteName(t: (key: string) => string) {
  const wordmark = `${t('site.logo.part1')}${t('site.logo.part2')}`.trim()

  if (!wordmark) {
    return t('site.name').replace(/\.dev$/i, '').trim()
  }

  if (isLatinWordmark(wordmark)) {
    return formatLatinWordmark(wordmark)
  }

  return wordmark
}

/** Logo wordmark parts — Latin locales show Mohet + ios while FA keeps i18n glyphs. */
export function getLogoParts(t: (key: string) => string) {
  const part1 = t('site.logo.part1')
  const part2 = t('site.logo.part2')
  const wordmark = `${part1}${part2}`.trim()

  if (isLatinWordmark(wordmark)) {
    const display = formatLatinWordmark(wordmark)
    return {
      part1: display.slice(0, part1.length),
      part2: display.slice(part1.length)
    }
  }

  return { part1, part2 }
}

export function formatSeoTitle({
  title,
  siteName,
  tagline,
  isHome = false
}: {
  title?: MaybeString
  siteName: string
  tagline: string
  isHome?: boolean
}) {
  const pageTitle = String(title || '').trim()

  if (isHome || !pageTitle || pageTitle === siteName) {
    return `${siteName} : ${tagline}`
  }

  return `${siteName} : ${pageTitle}`
}

export function toIsoDate(value?: string | Date) {
  if (!value) {
    return undefined
  }

  return new Date(value).toISOString()
}
