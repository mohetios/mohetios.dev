<script setup lang="ts">
const props = defineProps<{
  kind: 'blog' | 'lab' | 'project'
  title: string
  description?: string
  path: string
  image?: string
  date?: string | Date
  updated?: string | Date
}>()

const siteUrl = 'https://mohetios.dev'

function toIsoDate(value?: string | Date) {
  if (!value) {
    return undefined
  }

  return new Date(value).toISOString()
}

function absoluteUrl(path: string) {
  const normalized = path.startsWith('/') ? path : `/${path}`

  return new URL(normalized, siteUrl).toString()
}

const jsonLd = computed(() => {
  const pageUrl = absoluteUrl(props.path)
  const schemaType = props.kind === 'blog' ? 'BlogPosting' : 'Article'

  return {
    '@context': 'https://schema.org',
    '@type': schemaType,
    headline: props.title,
    description: props.description,
    image: props.image ? absoluteUrl(props.image) : undefined,
    datePublished: toIsoDate(props.date),
    dateModified: toIsoDate(props.updated || props.date),
    author: {
      '@type': 'Person',
      name: 'Ali Zemani'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Mohetios.dev'
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
