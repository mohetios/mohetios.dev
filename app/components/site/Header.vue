<script setup lang="ts">
const { locale, locales, t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

const navigation = computed(() => [
  { label: t('nav.home'), to: localePath('/') },
  { label: t('nav.blog'), to: localePath('/blog') },
  { label: t('nav.lab'), to: localePath('/lab') },
  { label: t('nav.projects'), to: localePath('/projects') },
  { label: t('nav.about'), to: localePath('/about') },
  { label: t('nav.contact'), to: localePath('/contact') }
])

const nextLocale = computed(
  () => locales.value.find((item) => item.code !== locale.value) || locales.value[0]
)
const nextLocalePath = computed(() =>
  nextLocale.value
    ? getLocalizedRoutePath(route.path, nextLocale.value.code, { fallbackToSection: true })
    : undefined
)
</script>

<template>
  <UHeader
    :title="t('site.name')"
    :to="localePath('/')"
    mode="slideover"
    :ui="{
      root: 'border-b border-default bg-default/90 backdrop-blur'
    }"
  >
    <template #left>
      <NuxtLink
        :to="localePath('/')"
        class="flex items-center gap-2 font-semibold tracking-tight"
        :aria-label="t('site.name')"
      >
        <span class="logo-mark">{{ t('site.name') }}</span>
      </NuxtLink>
    </template>

    <UNavigationMenu :items="navigation" variant="link" class="hidden lg:flex" />

    <template #right>
      <UButton
        v-if="nextLocale && nextLocalePath"
        :to="nextLocalePath"
        color="neutral"
        variant="ghost"
        icon="i-lucide-languages"
        :label="nextLocale.code.toUpperCase()"
        class="cursor-pointer"
      />
      <UColorModeButton />
    </template>

    <template #body>
      <UNavigationMenu :items="navigation" orientation="vertical" variant="link" class="-mx-2" />
    </template>
  </UHeader>
</template>
