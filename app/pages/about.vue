<script setup lang="ts">
const { locale, t } = useI18n()
const path = computed(() => `/${locale.value}/about`)
const legacyPath = computed(() => `/${locale.value}/pages/about`)

const { data: page } = await useAsyncData(
  `page:about:${locale.value}`,
  async () => {
    const localizedPage = await queryCollection('pages').where('path', '=', path.value).first()

    if (localizedPage) {
      return localizedPage
    }

    return queryCollection('pages').where('path', '=', legacyPath.value).first()
  },
  { watch: [locale] }
)

if (!page.value || page.value.draft) {
  throw createError({ statusCode: 404, statusMessage: 'About page not found', fatal: true })
}

useSeoMeta({
  title: () => `${page.value?.title} · Mohetios.dev`,
  description: page.value.description,
  ogTitle: page.value.title,
  ogDescription: page.value.description,
  ogImage: page.value.thumbnail,
  ogUrl: `https://mohetios.dev${page.value.path}`
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
        <ContentRenderer :value="page" class="prose-mohetios" />
      </article>
    </UPageBody>
  </UPage>
</template>
