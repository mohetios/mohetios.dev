<script setup lang="ts">
const { t } = useI18n()

const dashboardNavigation = computed(() => [
  {
    label: 'Overview',
    icon: 'i-lucide-layout-dashboard',
    to: '/dashboard'
  },
  {
    label: 'Leads',
    icon: 'i-lucide-users',
    to: '/dashboard/leads'
  },
  {
    label: 'Inbox',
    icon: 'i-lucide-mail',
    to: '/dashboard/inbox'
  },
  {
    label: 'Comments',
    icon: 'i-lucide-message-square',
    to: '/dashboard/comments'
  },
  {
    label: 'Analytics',
    icon: 'i-lucide-chart-column',
    to: '/dashboard/analytics'
  }
])

const searchGroups = computed(() => [
  {
    id: 'dashboard',
    label: 'Dashboard',
    items: dashboardNavigation.value.map((item) => ({
      ...item,
      onSelect: () => {
        return navigateTo(item.to)
      }
    }))
  }
])

onMounted(() => {
  console.log('[pwa debug]', {
    hasServiceWorker: 'serviceWorker' in navigator,
    displayModeStandalone: window.matchMedia('(display-mode: standalone)').matches,
    manifest: document.querySelector('link[rel="manifest"]')?.getAttribute('href')
  })

  navigator.serviceWorker?.getRegistration().then((registration) => {
    console.log('[pwa sw registration]', registration)
  })
})
</script>

<template>
  <UDashboardGroup storage-key="mohetios-dashboard" class="min-h-screen bg-default">
    <UDashboardSearch
      :groups="searchGroups"
      size="lg"
      placeholder="Search dashboard"
      :ui="{
        modal: 'sm:max-w-2xl',
        input: 'text-center'
      }"
    />

    <UDashboardSidebar
      collapsible
      :default-size="12"
      :min-size="12"
      :max-size="12"
      :collapsed-size="4"
      :ui="{
        root: 'border-e border-default bg-muted/20',
        header: 'px-3 py-3',
        body: 'gap-2 px-3 py-3',
        footer: 'hidden'
      }"
    >
      <template #header="{ collapsed }">
        <NuxtLink
          to="/dashboard"
          class="flex min-w-0 items-center gap-2"
          :class="collapsed ? 'justify-center' : 'justify-start'"
          :aria-label="t('dashboard.title')"
        >
          <span
            class="flex size-8 shrink-0 items-center justify-center rounded-lg border border-default bg-default text-sm font-semibold text-highlighted"
          >
            M
          </span>
          <span v-if="!collapsed" class="min-w-0">
            <span class="block truncate text-sm font-semibold text-highlighted">Mohetios</span>
            <span class="block truncate text-xs text-muted">{{ t('dashboard.title') }}</span>
          </span>
        </NuxtLink>
      </template>

      <template #default="{ collapsed }">
        <UNavigationMenu
          :items="dashboardNavigation"
          orientation="vertical"
          variant="link"
          :collapsed="collapsed"
          class="w-full"
          :ui="{
            list: 'items-stretch',
            item: 'w-full',
            link: collapsed ? 'justify-center' : 'justify-start',
            linkLeadingIcon: 'size-6'
          }"
        />
      </template>
    </UDashboardSidebar>

    <slot />
    <PwaInstallPrompt />
  </UDashboardGroup>
</template>
