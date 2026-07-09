<script setup lang="ts">
import type { TocItem } from '~/utils/content'

const { locale, t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const { navigation, isActive } = useSiteNavigation()

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
const shouldDimSidebarLamp = computed(() => contentTocLinks.value.length > 0)
const sidebarTitle = computed(() =>
  hasPageToc.value ? t('content.toc') : t('pages.tagsIndex.kicker')
)
</script>

<template>
  <img
    aria-hidden="true"
    src="/page-images/projects.webp"
    alt=""
    class="pointer-events-none absolute bottom-32 left-1/2 z-0 w-56 -translate-x-1/2 dark:hidden sm:w-64"
    :class="shouldDimSidebarLamp ? 'opacity-20' : 'opacity-55'"
  />
  <img
    aria-hidden="true"
    src="/page-images/projects-dark.webp"
    alt=""
    class="pointer-events-none absolute bottom-32 left-1/2 z-0 hidden w-56 -translate-x-1/2 dark:block sm:w-64"
    :class="shouldDimSidebarLamp ? 'opacity-20' : 'opacity-40'"
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

  <SiteSidebarFooter />
</template>
