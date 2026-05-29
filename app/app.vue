<script setup lang="ts">
import * as locales from '@nuxt/ui/locale'

const { locale, t } = useI18n()

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

useSeoMeta({
  title: () => t('site.name'),
  description: () => t('site.description'),
  ogTitle: () => t('site.name'),
  ogDescription: () => t('site.description'),
  ogSiteName: 'Mohetios.dev',
  ogType: 'website',
  twitterCard: 'summary'
})
</script>

<template>
  <UApp :locale="appLocale">
    <SiteHeader />

    <UMain>
      <div class="mx-auto max-w-6xl">
        <NuxtPage />
      </div>
    </UMain>

    <USeparator />
    <SiteFooter />
  </UApp>
</template>
