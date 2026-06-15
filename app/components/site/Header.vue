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
      root: 'border-b border-default bg-default/90 backdrop-blur',
      container: 'site-shell flex h-full items-center justify-between gap-3'
    }"
  >
    <template #left>
      <NuxtLink
        :to="localePath('/')"
        class="group/logo inline-flex min-w-0 items-center text-inherit no-underline"
        :aria-label="t('site.name')"
      >
        <SiteLogo show-tagline size="header" />
      </NuxtLink>
    </template>

    <UNavigationMenu
      :items="navigation"
      variant="link"
      class="hidden text-sm lg:flex"
    />

    <template #right>
      <div class="flex items-center gap-0.5">
        <UButton
          v-if="nextLocale && nextLocalePath"
          :to="nextLocalePath"
          color="neutral"
          variant="ghost"
          size="sm"
          icon="i-lucide-languages"
          :label="nextLocale.code.toUpperCase()"
          class="cursor-pointer"
        />
        <UColorModeButton color="neutral" variant="ghost" size="sm" />
      </div>
    </template>

    <template #body>
      <UNavigationMenu
        :items="navigation"
        orientation="vertical"
        variant="link"
        class="-mx-2 text-sm"
      />
    </template>
  </UHeader>
</template>
