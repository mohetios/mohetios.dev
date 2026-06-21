<script setup lang="ts">
import type { TocItem } from '~/utils/content'

const desktopMediaQuery = '(min-width: 1024px)'

const { locale, locales, t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const isDesktop = ref(false)
const mainMenuOpen = ref(false)
const sidebarOpen = ref<boolean | undefined>(undefined)
const isSidebarOpen = computed(() => sidebarOpen.value ?? isDesktop.value)

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
  navigation.value.map((item, index) => ({
    ...item,
    number: formatListNumber(index, locale.value)
  }))
)

const routeSectionPath = computed(() => stripLocalePrefix(toPublicPath(route.path)))
const contentPath = computed(() => toContentPath(route.path, locale.value))

const contentTocLinks = computed(() => {
  const item =
    getBlogPost(contentPath.value) ||
    getLabNote(contentPath.value) ||
    getProject(contentPath.value) ||
    getPage(contentPath.value)

  return item?.tocData && shouldShowToc(item.tocData) ? getTocNavLinks(item.tocData) : []
})

const staticPageTocLinks = computed<TocItem[]>(() => {
  switch (routeSectionPath.value) {
    case '/':
      return [
        { title: t('home.workbench.title'), url: '#workbench' },
        { title: t('home.notebook.title'), url: '#notebook' },
        { title: t('home.builtSystems.title'), url: '#built-systems' }
      ]
    case '/blog':
      return [
        { title: t('pages.notebook.entriesTitle'), url: '#latest-notes' },
        { title: t('pages.notebook.archive.title'), url: '#archive' },
        { title: t('pages.notebook.indexTitle'), url: '#tags' },
        { title: t('pages.notebook.nearbyTitle'), url: '#nearby' }
      ]
    case '/lab':
      return [
        { title: t('pages.labIndex.logsTitle'), url: '#lab-logs' },
        { title: t('pages.labIndex.status.title'), url: '#prototype-state' }
      ]
    case '/projects':
      return [
        { title: t('pages.systems.filesTitle'), url: '#system-files' },
        { title: t('pages.systems.status.title'), url: '#build-state' },
        { title: t('pages.systems.relatedTitle'), url: '#related-writing' }
      ]
    case '/about':
      return [
        { title: t('pages.aboutWorkshop.what.title'), url: '#what-is-mohetios' },
        { title: t('pages.aboutWorkshop.name.title'), url: '#the-name' },
        { title: t('pages.aboutWorkshop.how.title'), url: '#how-i-build' },
        { title: t('pages.aboutWorkshop.focus.title'), url: '#current-focus' },
        { title: t('about.latestWriting.title'), url: '#latest-writing' },
        { title: t('about.contactCta.title'), url: '#contact' }
      ]
    case '/contact':
      return [
        { title: t('pages.contactGate.kicker'), url: '#contact' },
        { title: t('contact.sidebar.label'), url: '#useful-context' },
        { title: t('pages.contactGate.response.title'), url: '#response-note' }
      ]
    case '/tags':
      return [
        { title: t('pages.tagsIndex.entriesTitle'), url: '#topic-entries' },
        { title: t('pages.tagsIndex.returnTitle'), url: '#return-paths' }
      ]
    default:
      if (routeSectionPath.value.startsWith('/tags/')) {
        return [
          { title: t('pages.tagPath.sections.notebook'), url: '#notebook' },
          { title: t('pages.tagPath.sections.lab'), url: '#lab' },
          { title: t('pages.tagPath.sections.systems'), url: '#systems' },
          { title: t('tags.allTags'), url: '#all-tags' }
        ]
      }

      return []
  }
})

const pageTocLinks = computed(() =>
  contentTocLinks.value.length ? contentTocLinks.value : staticPageTocLinks.value
)
const hasPageToc = computed(() => pageTocLinks.value.length > 0)
const sidebarTitle = computed(() =>
  hasPageToc.value ? t('content.toc') : t('pages.tagsIndex.kicker')
)
const sidebarTransformClass = computed(() => {
  if (sidebarOpen.value === undefined) {
    return '-translate-x-full rtl:translate-x-full lg:translate-x-0 lg:rtl:translate-x-0'
  }

  return isSidebarOpen.value ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full'
})
const sidebarTogglePositionClass = computed(() => {
  if (sidebarOpen.value === undefined) {
    return 'start-4 lg:start-[18.75rem]'
  }

  return isSidebarOpen.value ? 'start-[16.75rem] sm:start-[18.75rem]' : 'start-4'
})
const sidebarToggleIcon = computed(() => {
  if (locale.value === 'fa') {
    return isSidebarOpen.value ? 'i-lucide-panel-right-close' : 'i-lucide-panel-right-open'
  }

  return isSidebarOpen.value ? 'i-lucide-panel-left-close' : 'i-lucide-panel-left-open'
})

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

const currentYear = computed(() => {
  const calendar = locale.value === 'fa' ? 'persian' : 'gregory'

  return new Intl.DateTimeFormat(locale.value === 'fa' ? 'fa-IR-u-ca-persian' : 'en-US', {
    year: 'numeric',
    calendar
  }).format(new Date())
})

const socialLinks = [
  {
    label: 'GitHub',
    to: 'https://github.com/mohetios',
    icon: 'i-lucide-github'
  },
  {
    label: 'LinkedIn',
    to: 'https://www.linkedin.com/in/ali-zemani/',
    icon: 'i-lucide-linkedin'
  },
  {
    label: 'X',
    to: 'https://x.com/ZemaniAli',
    icon: 'i-lucide-twitter'
  },
  {
    label: 'Medium',
    to: 'https://medium.com/@mohetios',
    icon: 'i-lucide-book-open-text'
  }
]

const isActive = (to: string) => {
  const currentPath = stripLocalePrefix(toPublicPath(route.path))
  const targetPath = stripLocalePrefix(toPublicPath(to))

  if (targetPath === '/') {
    return currentPath === '/'
  }

  return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`)
}

function toggleSidebar() {
  const currentOpen = sidebarOpen.value ?? isDesktop.value

  mainMenuOpen.value = false
  sidebarOpen.value = !currentOpen
}

function toggleMainMenu() {
  const willOpen = !mainMenuOpen.value

  mainMenuOpen.value = willOpen

  if (willOpen) {
    sidebarOpen.value = false
  }
}

function closeMainMenu() {
  mainMenuOpen.value = false
}

function isDesktopViewport() {
  return window.matchMedia(desktopMediaQuery).matches
}

function closeSidebarAfterMobileLinkClick(event: MouseEvent) {
  if (
    import.meta.client &&
    event.target instanceof Element &&
    event.target.closest('a') &&
    !isDesktopViewport()
  ) {
    sidebarOpen.value = false
  }
}

function closeSidebarOnMobile() {
  if (import.meta.client && sidebarOpen.value === true && !isDesktopViewport()) {
    sidebarOpen.value = false
  }
}

onMounted(() => {
  const desktopQuery = window.matchMedia(desktopMediaQuery)
  const onBreakpointChange = () => {
    isDesktop.value = desktopQuery.matches

    if (isDesktop.value) {
      closeMainMenu()
    }

    closeSidebarOnMobile()
  }

  isDesktop.value = desktopQuery.matches
  closeSidebarOnMobile()
  desktopQuery.addEventListener('change', onBreakpointChange)

  onBeforeUnmount(() => {
    desktopQuery.removeEventListener('change', onBreakpointChange)
  })
})

watch(
  () => route.fullPath,
  () => {
    closeSidebarOnMobile()
    closeMainMenu()
  }
)
</script>

<template>
  <UButton
    color="neutral"
    variant="ghost"
    size="md"
    :icon="sidebarToggleIcon"
    class="fixed top-12 z-50 border border-default bg-default/95 text-muted shadow-sm transition-[inset-inline-start,color] duration-200 hover:text-primary lg:top-4"
    :class="sidebarTogglePositionClass"
    :aria-label="isSidebarOpen ? t('actions.closeSidebar') : t('actions.openSidebar')"
    @click="toggleSidebar"
  />

  <button
    v-if="isSidebarOpen"
    type="button"
    class="fixed inset-0 z-30 bg-inverted/15 backdrop-blur-[1px] lg:hidden"
    :aria-label="t('actions.closeSidebar')"
    @click="sidebarOpen = false"
  />

  <aside
    class="fixed inset-y-0 start-0 z-40 flex w-72 flex-col overflow-hidden border-e border-default bg-default px-6 py-8 text-highlighted transition-transform duration-200 ease-out sm:w-80 sm:px-8"
    :class="sidebarTransformClass"
    @click.capture="closeSidebarAfterMobileLinkClick"
  >
    <img
      aria-hidden="true"
      src="/page-images/projects.webp"
      alt=""
      class="pointer-events-none absolute bottom-29 left-1/2 z-0 w-56 -translate-x-1/2 opacity-55 dark:hidden sm:w-64"
    />
    <img
      aria-hidden="true"
      src="/page-images/projects-dark.webp"
      alt=""
      class="pointer-events-none absolute bottom-29 left-1/2 z-0 hidden w-56 -translate-x-1/2 opacity-40 dark:block sm:w-64"
    />

    <div class="relative z-10 flex min-h-0 flex-1 flex-col gap-6">
      <NuxtLink
        :to="localePath('/')"
        class="group/logo inline-flex text-highlighted no-underline"
        :aria-label="t('site.name')"
      >
        <SiteLogo show-tagline size="footer" />
      </NuxtLink>

      <nav class="flex min-h-0 flex-1 flex-col gap-4" :aria-label="sidebarTitle">
        <p class="mh-kicker text-highlighted">
          {{ sidebarTitle }}
        </p>
        <div class="mh-sidebar-scroll min-h-0 flex-1 overflow-y-auto pe-1">
          <ContentTocList v-if="hasPageToc" :links="pageTocLinks" ordered compact />
          <ul v-else class="space-y-2.5">
            <li v-for="item in sidebarIndex" :key="item.to">
              <NuxtLink
                :to="item.to"
                class="group grid grid-cols-[1.75rem_1fr] gap-2 text-[0.95rem] leading-6 text-muted no-underline transition hover:text-primary"
                :class="isActive(item.to) ? 'text-highlighted' : undefined"
              >
                <span class="font-mono text-xs tabular-nums text-muted">{{ item.number }}</span>
                <span>{{ item.label }}</span>
              </NuxtLink>
            </li>
          </ul>
        </div>
      </nav>
    </div>

    <div class="relative z-10 mt-auto shrink-0 space-y-4 pt-4">
      <div class="space-y-2 border-t border-default pt-3">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-1" :aria-label="t('footer.sections.connect')">
            <UButton
              v-for="link in socialLinks"
              :key="link.to"
              :to="link.to"
              :icon="link.icon"
              color="neutral"
              variant="ghost"
              size="sm"
              class="text-muted hover:text-primary"
              target="_blank"
              rel="noopener noreferrer"
              :aria-label="link.label"
            />
          </div>
          <div class="flex items-center gap-1">
            <UButton
              v-if="nextLocale && nextLocalePath"
              :to="nextLocalePath"
              color="neutral"
              variant="ghost"
              size="sm"
              icon="i-lucide-languages"
              :label="nextLocaleLabel"
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
        <p class="text-xs leading-5 text-muted">
          <span class="font-medium text-highlighted">{{ t('site.footer') }}</span>
          <span class="ms-1 font-normal text-muted">© {{ currentYear }} {{ t('site.name') }}</span>
        </p>
      </div>
    </div>
  </aside>

  <header class="hidden bg-default lg:block">
    <div class="site-shell flex h-20 items-stretch justify-end border-b border-default">
      <nav class="flex items-stretch gap-10" :aria-label="t('footer.navigationLabel')">
        <NuxtLink
          v-for="item in navigation"
          :key="item.to"
          :to="item.to"
          class="flex items-center border-b-2 px-1 text-base leading-6 no-underline transition"
          :class="
            isActive(item.to)
              ? 'border-primary text-primary'
              : 'border-transparent text-highlighted hover:border-primary hover:text-primary'
          "
        >
          {{ item.label }}
        </NuxtLink>
      </nav>
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

      <UButton
        color="neutral"
        variant="ghost"
        size="sm"
        :icon="mainMenuOpen ? 'i-lucide-x' : 'i-lucide-menu'"
        class="text-muted hover:text-primary"
        :aria-label="t('footer.navigationLabel')"
        @click="toggleMainMenu"
      />
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
            class="flex items-center justify-between py-3 text-base leading-6 no-underline transition"
            :class="isActive(item.to) ? 'text-primary' : 'text-highlighted hover:text-primary'"
            @click="closeMainMenu"
          >
            <span>{{ item.label }}</span>
            <UIcon name="i-lucide-arrow-up-right" class="size-4 text-muted" />
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </header>
</template>
