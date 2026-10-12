<script setup lang="ts">
import * as uiLocales from '@nuxt/ui/locale'

const { localeProperties } = useI18n()

const appLocale = computed(
  () => uiLocales[localeProperties.value.uiLocale as keyof typeof uiLocales] || uiLocales.en
)

// Per-page title, description, canonical and social tags come from useMohetiosSeo.
useHead({
  meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
  htmlAttrs: {
    lang: () => localeProperties.value.language,
    dir: () => localeProperties.value.dir
  }
})
</script>

<template>
  <UApp :locale="appLocale">
    <UMain class="w-full">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UMain>
  </UApp>
</template>
