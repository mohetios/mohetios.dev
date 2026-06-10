<script setup lang="ts">
import * as locales from '@nuxt/ui/locale'
import { getSeoSiteName, normalizeSiteUrl, resolveSeoImageUrl } from '~/utils/seo'

const { locale, loadLocaleMessages, t } = useI18n()
const siteUrl = normalizeSiteUrl(String(useRuntimeConfig().public.siteUrl))
const route = useRoute()
const localeCookie = useCookie<typeof locale.value | null>('mohetios_locale', {
  path: '/',
  sameSite: 'lax'
})
const isApplyingPanelLocale = ref(false)

const appLocale = computed(() => {
  const key = locale.value === 'fa' ? 'fa_ir' : 'en'
  return locales[key] || locales.en
})
const pathWithoutLocale = computed(() => stripLocalePrefix(route.path))
const isPanelRoute = computed(
  () =>
    pathWithoutLocale.value === '/dashboard' || pathWithoutLocale.value.startsWith('/dashboard/')
)
const isAuthLayout = computed(() => route.meta.layout === 'auth')
const isMinimalChrome = computed(() => isPanelRoute.value || isAuthLayout.value)
const savedPanelLocale = computed(() =>
  supportedLocales.find((code) => code === localeCookie.value)
)

watchEffect(() => {
  if (isPanelRoute.value && savedPanelLocale.value && locale.value !== savedPanelLocale.value) {
    void applyPanelLocale(savedPanelLocale.value)
  }
})

watch(locale, (value) => {
  if (isPanelRoute.value && !isApplyingPanelLocale.value) {
    localeCookie.value = value
  }
})

async function applyPanelLocale(value: typeof locale.value) {
  isApplyingPanelLocale.value = true

  try {
    await loadLocaleMessages(value)
    locale.value = value
  } finally {
    isApplyingPanelLocale.value = false
  }
}

useHead({
  meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
  htmlAttrs: {
    lang: () => appLocale.value.code,
    dir: () => appLocale.value.dir
  }
})

const siteTitle = computed(() => `${getSeoSiteName(t)} : ${t('site.tagline')}`)

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
    <SiteHeader v-if="!isMinimalChrome" />

    <UMain>
      <div :class="isMinimalChrome ? 'mx-auto max-w-none' : 'mx-auto max-w-6xl'">
        <NuxtLayout>
          <NuxtPage />
        </NuxtLayout>
      </div>
    </UMain>

    <template v-if="!isMinimalChrome">
      <USeparator />
      <SiteFooter />
    </template>

    <AdminPushPrompt />
  </UApp>
</template>
