<script setup lang="ts">
const { locale, t } = useI18n()
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
    <UPageHeader :title="page.title" :description="page.description" class="mx-auto max-w-4xl">
      <template #headline>
        <ContentMeta :updated="page.updated" :status="t('nav.about')" />
      </template>
    </UPageHeader>

    <UPageBody>
      <NuxtImg
        v-if="page.thumbnail"
        :src="page.thumbnail"
        :alt="page.title"
        class="mx-auto mb-10 aspect-[16/9] w-full max-w-4xl rounded-2xl object-cover ring ring-default"
        sizes="xs:100vw lg:860px"
      />

      <article class="mx-auto max-w-3xl rounded-2xl border border-default bg-default p-5 sm:p-8">
        <ContentHtml :html="page.content" class="prose-mohetios" />
      </article>
    </UPageBody>
  </UPage>
</template>
