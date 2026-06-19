<script setup lang="ts">
const props = defineProps<{
  sidebarOpen: boolean
}>()

const emit = defineEmits<{
  'update:sidebarOpen': [value: boolean]
}>()

const { locale, locales, t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

const navigation = computed(() => [
  { label: t('nav.home'), to: localePath('/') },
  { label: t('pages.notebook.kicker'), to: localePath('/blog') },
  { label: t('nav.lab'), to: localePath('/lab') },
  { label: t('pages.systems.kicker'), to: localePath('/projects') },
  { label: t('pages.tagsIndex.kicker'), to: localePath('/tags') },
  { label: t('nav.about'), to: localePath('/about') },
  { label: t('nav.contact'), to: localePath('/contact') }
])

const sidebarIndex = computed(() =>
  navigation.value
    .filter((item) => item.to !== localePath('/contact'))
    .map((item, index) => ({
      ...item,
      number: String(index + 1).padStart(2, '0')
    }))
)

const nextLocale = computed(
  () => locales.value.find((item) => item.code !== locale.value) || locales.value[0]
)
const nextLocalePath = computed(() =>
  nextLocale.value
    ? getLocalizedRoutePath(route.path, nextLocale.value.code, { fallbackToSection: true })
    : undefined
)

const isActive = (to: string) => {
  if (to === localePath('/')) {
    return route.path === to || route.path === `/${locale.value}`
  }

  return route.path === to || route.path.startsWith(`${to}/`)
}

function toggleSidebar() {
  emit('update:sidebarOpen', !props.sidebarOpen)
}
</script>

<template>
  <UButton
    color="neutral"
    variant="ghost"
    size="sm"
    :icon="sidebarOpen ? 'i-lucide-panel-left-close' : 'i-lucide-panel-left-open'"
    class="fixed top-4 z-50 hidden border border-default bg-default/95 text-muted shadow-sm transition-[inset-inline-start,color] duration-200 hover:text-primary lg:inline-flex"
    :class="sidebarOpen ? 'start-[18.75rem]' : 'start-4'"
    :aria-label="sidebarOpen ? t('actions.closeSidebar') : t('actions.openSidebar')"
    @click="toggleSidebar"
  />

  <aside
    class="fixed inset-y-0 start-0 z-40 hidden w-80 flex-col border-e border-default bg-default px-8 py-10 text-highlighted transition-transform duration-200 ease-out lg:flex"
    :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full'"
  >
    <div class="space-y-8">
      <NuxtLink
        :to="localePath('/')"
        class="group/logo inline-flex text-highlighted no-underline"
        :aria-label="t('site.name')"
      >
        <SiteLogo show-tagline size="footer" />
      </NuxtLink>

      <nav class="space-y-4" :aria-label="t('footer.navigationLabel')">
        <p class="mh-kicker text-highlighted">
          {{ t('pages.tagsIndex.kicker') }}
        </p>
        <ul class="space-y-3">
          <li v-for="item in sidebarIndex" :key="item.to">
            <NuxtLink
              :to="item.to"
              class="group grid grid-cols-[2rem_1fr] gap-3 text-sm leading-6 text-muted no-underline transition hover:text-primary"
              :class="isActive(item.to) ? 'text-highlighted' : undefined"
            >
              <span class="font-mono text-xs tabular-nums text-muted">{{ item.number }}</span>
              <span>{{ item.label }}</span>
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </div>

    <div class="mt-auto space-y-7">
      <figure>
        <img
          src="/workbench-lamp.png"
          :alt="t('home.hero.imageAlt')"
          class="w-full object-contain opacity-90 dark:hidden"
          loading="lazy"
        />
        <img
          src="/workbench-lamp-dark.png"
          alt=""
          aria-hidden="true"
          class="hidden w-full object-contain opacity-85 dark:block"
          loading="lazy"
        />
      </figure>

      <blockquote class="space-y-3 border-b border-default pb-7 text-sm leading-6 text-muted">
        <p>{{ t('footer.workshopQuote') }}</p>
        <footer class="text-highlighted">— M.</footer>
      </blockquote>

      <div class="flex items-center justify-between gap-3 text-xs text-muted">
        <span>MMXXIV</span>
        <span aria-hidden="true">•</span>
        <span>v1.0</span>
      </div>

      <div class="flex items-center gap-1 border-t border-default pt-4">
        <UButton
          v-if="nextLocale && nextLocalePath"
          :to="nextLocalePath"
          color="neutral"
          variant="ghost"
          size="sm"
          icon="i-lucide-languages"
          :label="nextLocale.code.toUpperCase()"
          class="cursor-pointer text-muted hover:text-primary"
        />
        <UColorModeButton
          color="neutral"
          variant="ghost"
          size="sm"
          class="text-muted hover:text-primary"
        />
      </div>
    </div>
  </aside>

  <UHeader
    :title="t('site.name')"
    :to="localePath('/')"
    mode="slideover"
    :ui="{
      root: 'border-b border-default bg-default lg:hidden',
      container: 'site-shell flex h-16 items-center justify-between gap-4'
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
      highlight
      highlight-color="primary"
      class="hidden text-sm lg:flex"
    />

    <template #right>
      <div class="flex items-center gap-1">
        <UButton
          v-if="nextLocale && nextLocalePath"
          :to="nextLocalePath"
          color="neutral"
          variant="ghost"
          size="sm"
          icon="i-lucide-languages"
          :label="nextLocale.code.toUpperCase()"
          class="cursor-pointer text-muted hover:text-primary"
        />
        <UColorModeButton
          color="neutral"
          variant="ghost"
          size="sm"
          class="text-muted hover:text-primary"
        />
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
