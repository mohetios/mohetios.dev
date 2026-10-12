import type { MaybeRefOrGetter } from 'vue'
import { defaultLocale, getLocaleDefinition, supportedLocales } from '~~/shared/constants/locales'
import {
  AUTHOR,
  absoluteUrl,
  cleanSeoDescription,
  formatSeoTitle,
  resolveSeoImageUrl,
  toIsoDate
} from '~/utils/seo'

type MaybeGetter<T> = MaybeRefOrGetter<T | undefined>

export type MohetiosSeoInput = {
  title?: MaybeGetter<string>
  description?: MaybeGetter<string>
  image?: MaybeGetter<string>
  type?: 'website' | 'article'
  noindex?: MaybeGetter<boolean>
  publishedAt?: MaybeGetter<string | Date>
  updatedAt?: MaybeGetter<string | Date>
  tags?: MaybeGetter<string[]>
  section?: MaybeGetter<string>
}

/**
 * Title, description, canonical, hreflang, Open Graph/Twitter and JSON-LD for the current route.
 * Articles without a thumbnail get a generated OG image.
 */
export function useMohetiosSeo(input: MohetiosSeoInput = {}) {
  const route = useRoute()
  const { locale, t } = useI18n()
  const siteUrl = String(useRuntimeConfig().public.siteUrl)

  const isArticle = input.type === 'article'
  const path = computed(() => route.path.replace(/(.)\/$/, '$1'))
  const canonicalUrl = computed(() => absoluteUrl(path.value, siteUrl))
  const siteName = computed(() => t('site.name'))
  const title = computed(() =>
    formatSeoTitle(toValue(input.title), siteName.value, t('site.tagline'))
  )
  const description = computed(() =>
    cleanSeoDescription(toValue(input.description), t('site.description'))
  )
  const ogLocale = (code: string) => getLocaleDefinition(code).language.replace('-', '_')

  // Only locales where this exact page exists; untranslated pages get no hreflang at all.
  const alternates = computed(() =>
    supportedLocales.flatMap((code) => {
      const translated = getTranslatedPath(path.value, code)

      return translated ? [{ code, href: absoluteUrl(translated, siteUrl) }] : []
    })
  )

  const useGeneratedImage = isArticle && !toValue(input.image)

  if (useGeneratedImage) {
    defineOgImage('ContentOgImage', {
      title: String(toValue(input.title) || ''),
      description: toValue(input.description),
      category: toValue(input.section),
      locale: locale.value,
      siteName: siteName.value,
      tagline: t('site.tagline')
    })
  }

  const imageUrl = computed(() =>
    useGeneratedImage ? undefined : resolveSeoImageUrl(toValue(input.image), siteUrl)
  )

  useSeoMeta({
    title,
    description,
    robots: () =>
      toValue(input.noindex) ? 'noindex, nofollow' : 'index, follow, max-image-preview:large',
    ogTitle: title,
    ogDescription: description,
    ogSiteName: siteName,
    ogType: input.type || 'website',
    ogUrl: canonicalUrl,
    ogLocale: () => ogLocale(locale.value),
    ogLocaleAlternate: () => {
      const others = alternates.value.filter(({ code }) => code !== locale.value)

      return others.length ? others.map(({ code }) => ogLocale(code)) : undefined
    },
    ogImage: imageUrl,
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: imageUrl,
    articlePublishedTime: () => (isArticle ? toIsoDate(toValue(input.publishedAt)) : undefined),
    articleModifiedTime: () => (isArticle ? toIsoDate(toValue(input.updatedAt)) : undefined),
    articleSection: () => (isArticle ? toValue(input.section) : undefined),
    articleTag: () => (isArticle ? toValue(input.tags) : undefined)
  })

  const person = computed(() => ({
    '@type': 'Person',
    '@id': `${siteUrl}/#author`,
    name: AUTHOR.name,
    url: absoluteUrl(`/${locale.value}/about`, siteUrl),
    sameAs: AUTHOR.sameAs
  }))

  const jsonLd = computed(() => {
    const inLanguage = getLocaleDefinition(locale.value).language

    if (isArticle) {
      const updatedAt = toValue(input.updatedAt) || toValue(input.publishedAt)

      return {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: toValue(input.title),
        description: description.value,
        url: canonicalUrl.value,
        mainEntityOfPage: canonicalUrl.value,
        image: toValue(input.image) ? resolveSeoImageUrl(toValue(input.image), siteUrl) : undefined,
        datePublished: toIsoDate(toValue(input.publishedAt)),
        dateModified: toIsoDate(updatedAt),
        keywords: toValue(input.tags)?.join(', ') || undefined,
        articleSection: toValue(input.section),
        inLanguage,
        author: person.value,
        publisher: person.value
      }
    }

    if (path.value === `/${locale.value}`) {
      return {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebSite',
            '@id': `${canonicalUrl.value}#website`,
            name: siteName.value,
            description: description.value,
            url: canonicalUrl.value,
            inLanguage,
            publisher: { '@id': person.value['@id'] }
          },
          person.value
        ]
      }
    }

    return undefined
  })

  useHead({
    link: () => [
      { rel: 'canonical' as const, href: canonicalUrl.value },
      ...(alternates.value.length > 1
        ? [
            ...alternates.value.map(({ code, href }) => ({
              rel: 'alternate' as const,
              hreflang: getLocaleDefinition(code).language,
              href
            })),
            ...alternates.value
              .filter(({ code }) => code === defaultLocale)
              .map(({ href }) => ({ rel: 'alternate' as const, hreflang: 'x-default', href }))
          ]
        : [])
    ],
    script: () =>
      jsonLd.value && !toValue(input.noindex)
        ? [{ type: 'application/ld+json', innerHTML: JSON.stringify(jsonLd.value) }]
        : []
  })

  return { canonicalUrl }
}
