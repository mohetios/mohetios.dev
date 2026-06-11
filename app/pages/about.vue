<script setup lang="ts">
const { locale, t } = useI18n()
const path = computed(() => `/${locale.value}/about`)
const legacyPath = computed(() => `/${locale.value}/pages/about`)
const page = computed(() => getPage(path.value) || getPage(legacyPath.value))

if (!page.value || page.value.draft) {
  throw createError({ statusCode: 404, statusMessage: 'About page not found', fatal: true })
}

useMohetiosSeo({
  title: () => page.value?.title,
  description: () => page.value?.description,
  path: () => toPublicPath(page.value?.path || path.value),
  image: () => page.value?.thumbnail,
  locale: () => locale.value,
  type: 'website'
})
</script>

<template>
  <UPage v-if="page">
    <UPageHeader :title="page.title" :description="page.description">
      <template #headline>
        <UBadge color="neutral" variant="outline">
          {{ t('content.about.eyebrow') }}
        </UBadge>
      </template>
    </UPageHeader>

    <UPageBody>
      <ContentCodeEnhancer />
      <ContentMermaidEnhancer />
      <ContentHtml :html="page.content" class="prose-mohetios max-w-none" />

      <section class="mt-10">
        <NewsletterSubscribe source="about" />
      </section>
    </UPageBody>
  </UPage>
</template>
