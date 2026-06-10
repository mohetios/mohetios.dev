<script setup lang="ts">
import { buildCanonicalUrl, normalizeSiteUrl, resolveAbsoluteUrl, toIsoDate } from '~/utils/seo'

const props = defineProps<{
  kind: 'blog' | 'lab' | 'project'
  title: string
  description?: string
  path: string
  image?: string
  date?: string | Date
  updated?: string | Date
}>()

const { t } = useI18n()
const siteUrl = normalizeSiteUrl(String(useRuntimeConfig().public.siteUrl))

const jsonLd = computed(() => {
  const pageUrl = buildCanonicalUrl(toPublicPath(props.path), siteUrl)
  const schemaType = props.kind === 'blog' ? 'BlogPosting' : 'Article'

  return {
    '@context': 'https://schema.org',
    '@type': schemaType,
    headline: props.title,
    description: props.description,
    image: props.image ? resolveAbsoluteUrl(props.image, siteUrl) : undefined,
    datePublished: toIsoDate(props.date),
    dateModified: toIsoDate(props.updated || props.date),
    author: {
      '@type': 'Person',
      name: 'Ali Zemani'
    },
    publisher: {
      '@type': 'Organization',
      name: t('site.name')
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': pageUrl
    }
  }
})

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: () => JSON.stringify(jsonLd.value)
    }
  ]
})
</script>

<template>
  <span class="sr-only" aria-hidden="true" />
</template>
