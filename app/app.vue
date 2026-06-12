<script setup lang="ts">
import * as locales from '@nuxt/ui/locale'
import { formatSeoTitle, getSeoSiteName, normalizeSiteUrl, resolveSeoImageUrl } from '~/utils/seo'

const { locale, t } = useI18n()
const siteUrl = normalizeSiteUrl(String(useRuntimeConfig().public.siteUrl))

const appLocale = computed(() => {
  const key = locale.value === 'fa' ? 'fa_ir' : 'en'
  return locales[key] || locales.en
})

useHead({
  meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
  htmlAttrs: {
    lang: () => appLocale.value.code,
    dir: () => appLocale.value.dir
  }
})

const siteTitle = computed(() =>
  formatSeoTitle({
    siteName: getSeoSiteName(t),
    tagline: t('site.tagline'),
    isHome: true
  })
)

useSeoMeta({
  title: siteTitle,
  description: () => t('site.description'),
  ogTitle: siteTitle,
  ogDescription: () => t('site.description'),
  ogSiteName: () => getSeoSiteName(t),
  ogType: 'website',
  ogImage: () => resolveSeoImageUrl(undefined, siteUrl),
  twitterCard: 'summary_large_image',
  twitterImage: () => resolveSeoImageUrl(undefined, siteUrl)
})
</script>

<template>
  <UApp :locale="appLocale">
    <UMain class="w-full">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UMain>

    <AdminPushPrompt />
  </UApp>
</template>
