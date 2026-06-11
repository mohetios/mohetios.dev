import type { MaybeRefOrGetter } from 'vue'
import { defaultLocale } from '~/utils/content'
import {
  buildCanonicalUrl,
  cleanSeoDescription,
  formatSeoTitle,
  getSeoSiteName,
  normalizePath,
  normalizeSiteUrl,
  resolveSeoImageUrl,
  toIsoDate
} from '~/utils/seo'

export type MohetiosSeoInput = {
  title: MaybeRefOrGetter<string | undefined>
  description?: MaybeRefOrGetter<string | undefined>
  path?: MaybeRefOrGetter<string | undefined>
  image?: MaybeRefOrGetter<string | undefined>
  locale?: MaybeRefOrGetter<string | undefined>
  type?: MaybeRefOrGetter<'website' | 'article'>
  noindex?: MaybeRefOrGetter<boolean | undefined>
  publishedAt?: MaybeRefOrGetter<string | Date | undefined>
  updatedAt?: MaybeRefOrGetter<string | Date | undefined>
  tags?: MaybeRefOrGetter<string[] | undefined>
  ogComponent?: MaybeRefOrGetter<
    | {
        name: 'ContentOgImage'
        props?: Record<string, string | undefined>
      }
    | undefined
  >
}

function getLocaleCode(locale: string | { code: string }) {
  return typeof locale === 'string' ? locale : locale.code
}

function getOgLocale(locale: string | { code: string; language?: string }) {
  const value = typeof locale === 'string' ? locale : locale.language || locale.code

  return value.replace('-', '_')
}

export function useMohetiosSeo(input: MohetiosSeoInput) {
  const route = useRoute()
  const config = useRuntimeConfig()
  const { locale, locales, t } = useI18n()

  const siteUrl = normalizeSiteUrl(String(config.public.siteUrl))
  const siteName = computed(() => getSeoSiteName(t))

  const pagePath = computed(() => normalizePath(toValue(input.path) || route.path))
  const canonicalPath = computed(() => toPublicPath(pagePath.value))
  const canonicalUrl = computed(() => buildCanonicalUrl(canonicalPath.value, siteUrl))
  const isHome = computed(() => stripLocalePrefix(pagePath.value) === '/')
  const title = computed(() =>
    formatSeoTitle({
      title: toValue(input.title),
      siteName: siteName.value,
      tagline: t('site.tagline'),
      isHome: isHome.value
    })
  )
  const description = computed(() =>
    cleanSeoDescription(toValue(input.description), t('site.description'))
  )
  const imageUrl = computed(() => resolveSeoImageUrl(toValue(input.image), siteUrl))
  const seoType = computed(() => toValue(input.type) || 'website')
  const noindex = computed(() => Boolean(toValue(input.noindex)))
  const tags = computed(() => toValue(input.tags) || [])

  const staticOgComponent = toValue(input.ogComponent)

  if (!toValue(input.image) && staticOgComponent) {
    defineOgImage(staticOgComponent.name, staticOgComponent.props || {})
  }

  useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogSiteName: siteName,
    ogType: seoType,
    ogUrl: canonicalUrl,
    ogImage: imageUrl,
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: imageUrl,
    articlePublishedTime: () => toIsoDate(toValue(input.publishedAt)),
    articleModifiedTime: () => toIsoDate(toValue(input.updatedAt)),
    articleTag: () => (seoType.value === 'article' ? tags.value : undefined),
    robots: () => (noindex.value ? 'noindex, nofollow' : 'index, follow')
  })

  const pageLocale = computed(() => toValue(input.locale) || locale.value)
  const currentLocaleEntry = computed(() =>
    locales.value.find((item) => getLocaleCode(item) === pageLocale.value)
  )

  useHead({
    htmlAttrs: {
      lang: () => {
        const entry = currentLocaleEntry.value

        if (entry && typeof entry === 'object' && 'language' in entry && entry.language) {
          return entry.language
        }

        return pageLocale.value
      }
    },
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
                href: buildCanonicalUrl(localizedPath, siteUrl)
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
              href: buildCanonicalUrl(defaultLocalizedPath, siteUrl)
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

  return {
    canonicalUrl
  }
}
