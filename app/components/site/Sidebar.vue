<script setup lang="ts">
const props = defineProps<{
  closeMainMenu?: () => void
  headerVisible?: boolean
}>()

const { locale, t } = useI18n()
const route = useRoute()
const {
  isDesktop,
  desktopOpen,
  mobileOpen,
  isSidebarOpen,
  sidebarTogglePositionClass,
  toggleSidebar,
  closeSidebarOnMobile
} = useSiteSidebar()

const drawerDirection = computed(() => (locale.value === 'fa' ? 'right' : 'left'))
const mobileToggleVisibilityClass = computed(() => {
  return props.headerVisible === false ? '-translate-y-24 opacity-0' : 'translate-y-0 opacity-100'
})
const sidebarToggleIcon = computed(() => {
  if (locale.value === 'fa') {
    return isSidebarOpen.value ? 'i-lucide-panel-right-close' : 'i-lucide-panel-right-open'
  }

  return isSidebarOpen.value ? 'i-lucide-panel-left-close' : 'i-lucide-panel-left-open'
})

const drawerUi = {
  content:
    'inset-y-0 h-full w-[min(100vw,18rem)] max-w-none flex-col rounded-none border-e border-default p-0 ring-0',
  container: 'flex h-full w-full min-h-0 flex-col gap-0 overflow-hidden p-0',
  header: 'hidden',
  body: 'min-h-0 flex-1 overflow-hidden p-0',
  footer: 'hidden'
}

function toggleSidebarFromButton() {
  props.closeMainMenu?.()
  toggleSidebar()
}

function closeSidebarAfterLinkClick(event: MouseEvent) {
  if (import.meta.client && event.target instanceof Element && event.target.closest('a')) {
    closeSidebarOnMobile()
    props.closeMainMenu?.()
  }
}

function closeSidebarFromDrawer() {
  closeSidebarOnMobile()
  props.closeMainMenu?.()
}

watch(
  () => route.fullPath,
  () => {
    closeSidebarOnMobile()
    props.closeMainMenu?.()
  }
)
</script>

<template>
  <UButton
    color="neutral"
    variant="ghost"
    size="md"
    :icon="sidebarToggleIcon"
    class="fixed top-[2.875rem] z-50 border border-default bg-default/95 text-muted shadow-sm transition-[inset-inline-start,transform,opacity,color] duration-200 hover:text-primary lg:top-4"
    :class="[sidebarTogglePositionClass, !isDesktop ? mobileToggleVisibilityClass : '']"
    :aria-label="isSidebarOpen ? t('actions.closeSidebar') : t('actions.openSidebar')"
    @click="toggleSidebarFromButton"
  />

  <aside
    class="fixed inset-y-0 start-0 z-40 hidden w-72 flex-col overflow-hidden border-e border-default bg-default px-6 py-8 text-highlighted transition-transform duration-200 ease-out sm:w-80 sm:px-8 lg:flex"
    :class="desktopOpen ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full pointer-events-none'"
    @click.capture="closeSidebarAfterLinkClick"
  >
    <SiteSidebarContent />
  </aside>

  <UDrawer
    v-model:open="mobileOpen"
    :direction="drawerDirection"
    :handle="false"
    :inset="false"
    :ui="drawerUi"
  >
    <template #body>
      <div
        v-if="!isDesktop"
        class="relative flex h-full w-full min-h-0 flex-col overflow-hidden bg-default px-6 py-8 text-highlighted sm:px-8"
        @click.capture="closeSidebarAfterLinkClick"
      >
        <UButton
          color="neutral"
          variant="ghost"
          size="sm"
          icon="i-lucide-x"
          class="absolute end-4 top-4 z-10"
          :aria-label="t('actions.closeSidebar')"
          @click="closeSidebarFromDrawer"
        />
        <SiteSidebarContent />
      </div>
    </template>
  </UDrawer>
</template>
