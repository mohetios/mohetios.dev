<script setup lang="ts">
const { locale } = useI18n()
const path = computed(() => `/${locale.value}/about`)
const legacyPath = computed(() => `/${locale.value}/pages/about`)
const page = computed(() => getPage(path.value) || getPage(legacyPath.value))

if (!page.value || page.value.draft) {
  throw createError({ statusCode: 404, statusMessage: 'About page not found', fatal: true })
}

useMohetSeo({
  title: () => `${page.value?.title} · Mohetios.dev`,
  description: page.value.description,
  path: () => page.value?.path,
  image: () => page.value?.thumbnail
})
</script>

<template>
  <UPage v-if="page">
    <ContentHero :title="page.title" :description="page.description" />

    <UPageBody>
      <article class="mx-auto max-w-3xl">
        <ContentHtml :html="page.content" class="prose-mohetios" />
      </article>

      <section class="mx-auto mt-10 max-w-3xl">
        <NewsletterSubscribe source="about" />
      </section>
    </UPageBody>
  </UPage>
</template>
