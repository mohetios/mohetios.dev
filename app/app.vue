<script setup lang="ts">
import * as locales from '@nuxt/ui/locale'

const { locale, t } = useI18n()
const route = useRoute()

const appLocale = computed(() => {
  const key = locale.value === 'fa' ? 'fa_ir' : 'en'
  return locales[key] || locales.en
})
const pathWithoutLocale = computed(() => route.path.replace(/^\/(en|fa)(?=\/|$)/, '') || '/')
const isPanelRoute = computed(
  () =>
    pathWithoutLocale.value === '/dashboard' ||
    pathWithoutLocale.value.startsWith('/dashboard/')
)

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
    <SiteHeader v-if="!isPanelRoute" />

    <UMain>
      <div :class="isPanelRoute ? 'mx-auto max-w-none' : 'mx-auto max-w-6xl'">
        <NuxtLayout>
          <NuxtPage />
        </NuxtLayout>
      </div>
    </UMain>

    <template v-if="!isPanelRoute">
      <USeparator />
      <SiteFooter />
    </template>
  </UApp>
</template>
