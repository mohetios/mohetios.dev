export type MaybeString = string | null | undefined

const DEFAULT_OG_IMAGE_PATH = '/page-images/home.webp'

export const AUTHOR = {
  name: 'Ali Zemani',
  sameAs: [
    'https://github.com/mohetios',
    'https://www.linkedin.com/in/ali-zemani/',
    'https://x.com/mohetios',
    'https://medium.com/@mohetios'
  ]
}

export function absoluteUrl(url: string, siteUrl: string) {
  if (/^https?:\/\//.test(url)) {
    return url
  }

  return `${siteUrl.replace(/\/$/, '')}${url.startsWith('/') ? url : `/${url}`}`
}

export function resolveSeoImageUrl(url: MaybeString, siteUrl: string) {
  return absoluteUrl(url || DEFAULT_OG_IMAGE_PATH, siteUrl)
}

/** Search snippets cut around 155–160 characters; trim on a word boundary. */
export function cleanSeoDescription(value?: MaybeString, fallback = '') {
  const text = String(value || fallback)
    .replace(/\s+/g, ' ')
    .trim()

  if (text.length <= 160) {
    return text
  }

  return `${text.slice(0, 157).replace(/\s+\S*$/, '')}…`
}

/** Page title first so it survives truncation in search results and tabs. */
export function formatSeoTitle(title: MaybeString, siteName: string, tagline: string) {
  const pageTitle = String(title || '').trim()

  return !pageTitle || pageTitle === siteName
    ? `${siteName} | ${tagline}`
    : `${pageTitle} | ${siteName}`
}

export function toIsoDate(value?: string | Date) {
  return value ? new Date(value).toISOString() : undefined
}
