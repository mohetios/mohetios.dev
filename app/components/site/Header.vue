<script setup lang="ts">
const { locale, locales, t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const { navigation, isActive } = useSiteNavigation()
const { closeSidebar } = useSiteSidebar()

const mobileMenuLinkClass =
  'flex items-center justify-between py-3 text-base leading-6 no-underline transition hover:text-primary'
const desktopMenuLinkClass =
  'flex items-center border-b-2 px-1 text-base leading-6 no-underline transition'
const mainMenuOpen = ref(false)
const isHeaderVisible = ref(true)

let lastScrollY = 0
let isTicking = false

const nextLocale = computed(
  () => locales.value.find((item) => item.code !== locale.value) || locales.value[0]
)
const nextLocalePath = computed(() =>
  nextLocale.value
    ? getLocalizedRoutePath(route.path, nextLocale.value.code, { fallbackToSection: true })
    : undefined
)
const nextLocaleLabel = computed(() => {
  if (!nextLocale.value) {
    return ''
  }

  return nextLocale.value.code === 'fa'
    ? t('actions.switchToPersian')
    : t('actions.switchToEnglish')
})

function toggleMainMenu() {
  const willOpen = !mainMenuOpen.value

  mainMenuOpen.value = willOpen

  if (willOpen) {
    closeSidebar()
  }
}

function closeMainMenu() {
  mainMenuOpen.value = false
}

function syncHeaderVisibility() {
  const currentY = window.scrollY
  const delta = currentY - lastScrollY

  if (mainMenuOpen.value || currentY <= 24 || delta < -6) {
    isHeaderVisible.value = true
  } else if (delta > 8) {
    isHeaderVisible.value = false
  }

  lastScrollY = currentY
  isTicking = false
}

function onScroll() {
  if (isTicking) {
    return
  }

  isTicking = true
  window.requestAnimationFrame(syncHeaderVisibility)
}

watch(mainMenuOpen, (open) => {
  if (open) {
    isHeaderVisible.value = true
  }
})

watch(
  () => route.fullPath,
  () => {
    closeMainMenu()
    isHeaderVisible.value = true
  }
)

onMounted(() => {
  lastScrollY = window.scrollY
  window.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <SiteSidebar :close-main-menu="closeMainMenu" :header-visible="isHeaderVisible" />

  <div
    class="fixed inset-x-0 top-0 z-30 transition-transform duration-200"
    :class="isHeaderVisible ? 'translate-y-0' : '-translate-y-full'"
  >
    <header class="hidden bg-default lg:block">
      <div class="site-shell flex h-20 items-stretch justify-between gap-6 border-b border-default">
        <nav class="flex items-stretch gap-10" :aria-label="t('footer.navigationLabel')">
          <NuxtLink
            v-for="item in navigation"
            :key="item.to"
            :to="item.to"
            :class="[
              desktopMenuLinkClass,
              isActive(item.to)
                ? 'border-primary text-primary'
                : 'border-transparent text-highlighted hover:border-primary hover:text-primary'
            ]"
          >
            {{ item.label }}
          </NuxtLink>
        </nav>

        <div class="flex items-stretch gap-6">
          <NuxtLink
            v-if="nextLocalePath"
            :to="nextLocalePath"
            :class="[
              desktopMenuLinkClass,
              'gap-1.5 border-transparent text-highlighted hover:border-primary hover:text-primary'
            ]"
          >
            <UIcon name="i-lucide-languages" class="size-4 shrink-0" />
            <span>{{ nextLocaleLabel }}</span>
          </NuxtLink>
          <div class="flex items-center border-b-2 border-transparent px-1">
            <UColorModeButton
              color="neutral"
              variant="ghost"
              class="text-muted hover:text-primary"
              :aria-label="t('actions.theme')"
            />
          </div>
        </div>
      </div>
    </header>

    <header class="border-b border-default bg-default lg:hidden">
      <div class="site-shell flex h-16 items-center justify-between gap-4">
        <NuxtLink
          :to="localePath('/')"
          class="group/logo inline-flex min-w-0 items-center text-inherit no-underline"
          :aria-label="t('site.name')"
        >
          <SiteLogo show-tagline size="header" />
        </NuxtLink>

        <div class="flex items-center gap-1" dir="ltr">
          <UButton
            color="neutral"
            variant="ghost"
            size="sm"
            :icon="mainMenuOpen ? 'i-lucide-x' : 'i-lucide-menu'"
            class="text-muted hover:text-primary"
            :aria-label="t('footer.navigationLabel')"
            @click="toggleMainMenu"
          />
          <UButton
            v-if="nextLocalePath"
            :to="nextLocalePath"
            color="neutral"
            variant="ghost"
            size="sm"
            icon="i-lucide-languages"
            class="text-muted hover:text-primary"
            :aria-label="nextLocaleLabel"
          />
          <UColorModeButton
            color="neutral"
            variant="ghost"
            size="sm"
            class="text-muted hover:text-primary"
            :aria-label="t('actions.theme')"
          />
        </div>
      </div>
      <nav
        v-if="mainMenuOpen"
        class="site-shell border-t border-default pb-3 pt-12"
        :aria-label="t('footer.navigationLabel')"
      >
        <ul class="divide-y divide-default">
          <li v-for="item in navigation" :key="item.to">
            <NuxtLink
              :to="item.to"
              :class="[
                mobileMenuLinkClass,
                isActive(item.to) ? 'text-primary' : 'text-highlighted'
              ]"
              @click="closeMainMenu"
            >
              <span>{{ item.label }}</span>
              <UIcon name="i-lucide-arrow-up-right" class="size-4 shrink-0 text-muted" />
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </header>
  </div>

  <div class="hidden h-20 lg:block" />
  <div class="h-16 lg:hidden" />
</template>
