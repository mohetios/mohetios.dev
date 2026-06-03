import type { MaybeRefOrGetter } from 'vue'

type SeoInput = {
  title: MaybeRefOrGetter<string | undefined>
  description: MaybeRefOrGetter<string | undefined>
  path?: MaybeRefOrGetter<string | undefined>
  image?: MaybeRefOrGetter<string | undefined>
  type?: MaybeRefOrGetter<'website' | 'article'>
  publishedTime?: MaybeRefOrGetter<string | Date | undefined>
  modifiedTime?: MaybeRefOrGetter<string | Date | undefined>
}

const siteUrl = 'https://mohetios.dev'
const siteName = 'Mohetios.dev'
const defaultLocale = 'en'

function cleanTitle(title?: string) {
  return title?.replace(/\s*[·-]\s*Mohetios\.dev$/i, '') || siteName
}

function normalizePath(path?: string) {
  if (!path || path === '/') {
    return '/'
  }

  return path.startsWith('/') ? path : `/${path}`
}

function absoluteUrl(path?: string) {
  return new URL(normalizePath(path), siteUrl).toString()
}

function toIsoDate(value?: string | Date) {
  if (!value) {
    return undefined
  }

  return new Date(value).toISOString()
}

function getLocaleCode(locale: string | { code: string }) {
  return typeof locale === 'string' ? locale : locale.code
}

function getOgLocale(locale: string | { code: string; language?: string }) {
  const value = typeof locale === 'string' ? locale : locale.language || locale.code

  return value.replace('-', '_')
}

export function useMohetSeo(input: SeoInput) {
  const route = useRoute()
  const { locale, locales } = useI18n()

  const canonicalPath = computed(() => toPublicPath(normalizePath(toValue(input.path) || route.path)))
  const canonicalUrl = computed(() => absoluteUrl(canonicalPath.value))
  const title = computed(() => {
    const value = cleanTitle(toValue(input.title))

    return value === siteName ? siteName : `${value} - ${siteName}`
  })
  const description = computed(() => toValue(input.description) || '')
  const image = computed(() => {
    const value = toValue(input.image)

    return value ? absoluteUrl(value) : undefined
  })

  useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogSiteName: siteName,
    ogType: () => toValue(input.type) || 'website',
    ogUrl: canonicalUrl,
    ogImage: image,
    twitterCard: () => (image.value ? 'summary_large_image' : 'summary'),
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: image,
    articlePublishedTime: () => toIsoDate(toValue(input.publishedTime)),
    articleModifiedTime: () => toIsoDate(toValue(input.modifiedTime))
  })

  useHead({
    link: computed(() => {
      const localeCodes = locales.value.map((item) => getLocaleCode(item))
      const orderedLocaleCodes = [
        defaultLocale,
        ...localeCodes.filter((code) => code !== defaultLocale)
      ]

      const alternates = orderedLocaleCodes.flatMap((code) => {
        const localizedPath = getLocalizedRoutePath(canonicalPath.value, code)

        return localizedPath
          ? [
              {
                rel: 'alternate',
                hreflang: code,
                href: absoluteUrl(localizedPath)
              }
            ]
          : []
      })
      const defaultLocalizedPath = getLocalizedRoutePath(canonicalPath.value, defaultLocale)
      const defaultAlternate = defaultLocalizedPath
        ? [
            {
              rel: 'alternate',
              hreflang: 'x-default',
              href: absoluteUrl(defaultLocalizedPath)
            }
          ]
        : []

      return [{ rel: 'canonical', href: canonicalUrl.value }, ...alternates, ...defaultAlternate]
    }),
    meta: computed(() => {
      const currentLocale = locales.value.find((item) => getLocaleCode(item) === locale.value)
      const alternateLocales = locales.value.filter((item) => {
        const code = getLocaleCode(item)

        return code !== locale.value && getLocalizedRoutePath(canonicalPath.value, code)
      })

      return [
        { property: 'og:locale', content: getOgLocale(currentLocale || locale.value) },
        ...alternateLocales.map((item) => ({
          property: 'og:locale:alternate',
          content: getOgLocale(item)
        }))
      ]
    })
  })
}
