export type MaybeString = string | null | undefined

export const DEFAULT_OG_IMAGE_PATH = '/content/physics.webp'

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
  const pageTitle = String(title || '')
    .replace(new RegExp(`^\\s*${siteName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*[:·|-]\\s*`, 'i'), '')
    .replace(new RegExp(`\\s*[:·|-]\\s*${siteName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'i'), '')
    .trim()

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
