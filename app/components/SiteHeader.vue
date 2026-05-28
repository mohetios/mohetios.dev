<script setup lang="ts">
const { locale, locales, t } = useI18n()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()

const navigation = computed(() => [
  { label: t('nav.home'), to: localePath('/') },
  { label: t('nav.blog'), to: localePath('/blog') },
  { label: t('nav.lab'), to: localePath('/lab') },
  { label: t('nav.projects'), to: localePath('/projects') },
  { label: t('nav.about'), to: localePath('/about') }
])

const languageItems = computed(() =>
  locales.value.map((item) => ({
    label: item.name,
    to: switchLocalePath(item.code),
    active: item.code === locale.value
  }))
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
        <span
          class="logo-mark grid size-8 place-items-center border border-default bg-default text-sm font-bold"
          >م</span
        >
        <span class="logo-mark">{{ t('site.name') }}</span>
      </NuxtLink>
    </template>

    <UNavigationMenu :items="navigation" variant="link" class="hidden lg:flex" />

    <template #right>
      <UDropdownMenu :items="languageItems">
        <UButton
          color="neutral"
          variant="ghost"
          icon="i-lucide-languages"
          :label="locale.toUpperCase()"
        />
      </UDropdownMenu>
      <UColorModeButton />
    </template>

    <template #body>
      <UNavigationMenu :items="navigation" orientation="vertical" variant="link" class="-mx-2" />
    </template>
  </UHeader>
</template>
