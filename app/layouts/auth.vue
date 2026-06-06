<script setup lang="ts">
const { locale, locales, t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

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
  <div class="flex min-h-svh flex-col">
    <header class="border-b border-default bg-default/90 backdrop-blur">
      <div class="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
        <NuxtLink
          :to="localePath('/')"
          class="logo-mark font-semibold tracking-tight"
          :aria-label="t('site.name')"
        >
          {{ t('site.name') }}
        </NuxtLink>

        <div class="flex items-center gap-1">
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
        </div>
      </div>
    </header>

    <main class="flex flex-1 items-center justify-center px-4 py-12">
      <slot />
    </main>
  </div>
</template>
