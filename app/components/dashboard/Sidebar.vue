<script setup lang="ts">
const { locale, t } = useI18n()
const brandName = computed(() => getSeoSiteName(t))
const route = useRoute()

type DashboardNavItem = {
  label: string
  icon: string
  to: string
  count?: number
}

const auth = useAuth()
auth.restoreToken()

const { data: navCounts, refresh: refreshNavCounts } = await useAsyncData(
  'dashboard:nav-counts',
  async () => {
    const result = await GqlDashboardNavCounts()
    return result.dashboardNavCounts
  },
  {
    default: () => ({
      inboxUnread: 0,
      pendingComments: 0
    })
  }
)

const navItems = computed<DashboardNavItem[]>(() => [
  {
    label: t('dashboard.nav.overview'),
    icon: 'i-lucide-house',
    to: '/dashboard'
  },
  {
    label: t('dashboard.nav.inbox'),
    icon: 'i-lucide-inbox',
    to: '/dashboard/inbox',
    count: navCounts.value.inboxUnread
  },
  {
    label: t('dashboard.nav.leads'),
    icon: 'i-lucide-users',
    to: '/dashboard/leads'
  },
  {
    label: t('dashboard.nav.newsletter'),
    icon: 'i-lucide-mail-plus',
    to: '/dashboard/newsletter'
  },
  {
    label: t('dashboard.nav.comments'),
    icon: 'i-lucide-message-square',
    to: '/dashboard/comments',
    count: navCounts.value.pendingComments
  },
  // {
  //   label: t('dashboard.nav.content'),
  //   icon: 'i-lucide-file-text',
  //   to: '/dashboard/content'
  // },
  {
    label: t('dashboard.nav.analytics'),
    icon: 'i-lucide-chart-column',
    to: '/dashboard/analytics'
  }
  // {
  //   label: t('dashboard.nav.system'),
  //   icon: 'i-lucide-server',
  //   to: '/dashboard/system'
  // },
  // {
  //   label: t('dashboard.nav.settings'),
  //   icon: 'i-lucide-settings',
  //   to: '/dashboard/settings'
  // }
])

function stripLocale(path: string) {
  return path.replace(/^\/(en|fa)(?=\/|$)/, '') || '/'
}

const currentPath = computed(() => stripLocale(route.path))

watch(
  () => route.fullPath,
  () => {
    refreshNavCounts().catch(() => undefined)
  }
)

function isActive(path: string) {
  if (path === '/dashboard') {
    return currentPath.value === '/dashboard'
  }

  return currentPath.value === path || currentPath.value.startsWith(`${path}/`)
}

function formatBadgeCount(count: number, max: number) {
  const value = count > max ? `${max}+` : count

  return formatLocalizedNumber(value, locale.value)
}
</script>

<template>
  <UDashboardSidebar
    collapsible
    class="border-e border-mohstone-200 bg-mohstone-50 dark:border-mohstone-800/60 dark:bg-ink-950 dark:text-mohstone-100"
    :ui="{
      header: 'border-b border-mohstone-200 p-3 dark:border-mohstone-800/60',
      body: 'p-3',
      footer: 'border-t border-mohstone-200 p-2 dark:border-mohstone-800/60'
    }"
  >
    <template #header="{ collapsed }">
      <div
        class="flex h-14 items-center gap-2"
        :class="collapsed ? 'justify-center' : 'justify-between'"
      >
        <NuxtLink
          to="/dashboard"
          class="group/logo inline-flex min-w-0 items-center text-inherit no-underline"
          :class="collapsed ? 'justify-center' : ''"
          :aria-label="`${brandName} ${t('dashboard.title')}`"
        >
          <span
            v-if="collapsed"
            class="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-base font-bold text-primary"
          >
            {{ brandName.charAt(0) }}
          </span>
          <SiteLogo
            v-else
            show-tagline
            caption-key="dashboard.title"
            size="dashboard"
          />
        </NuxtLink>
      </div>
    </template>

    <template #default="{ collapsed }">
      <nav class="space-y-1" aria-label="Dashboard navigation">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="group relative flex min-h-10 items-center rounded-xl px-3 py-2 text-sm transition"
          :class="[
            isActive(item.to)
              ? 'bg-primary/10 text-primary'
              : 'text-muted hover:bg-mohstone-100 hover:text-highlighted dark:hover:bg-ink-900',
            collapsed ? 'justify-center px-2' : 'gap-3'
          ]"
          :aria-current="isActive(item.to) ? 'page' : undefined"
          :title="collapsed ? item.label : undefined"
        >
          <span
            class="flex min-w-0 items-center"
            :class="collapsed ? 'justify-center gap-0' : 'gap-3'"
          >
            <UIcon :name="item.icon" class="size-5 shrink-0" />
            <span v-if="!collapsed" class="truncate font-medium">
              {{ item.label }}
            </span>
          </span>
          <span
            v-if="!collapsed && item.count != null && item.count > 0"
            class="ms-auto inline-flex min-w-5 items-center justify-center rounded-full bg-primary/10 px-1.5 text-xs font-medium tabular-nums text-primary"
          >
            {{ formatBadgeCount(item.count, 99) }}
          </span>
          <span
            v-else-if="collapsed && item.count != null && item.count > 0"
            class="absolute -me-1 -mt-1 ms-5 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium leading-4 tabular-nums text-inverted"
          >
            {{ formatBadgeCount(item.count, 9) }}
          </span>
        </NuxtLink>
      </nav>
    </template>

    <template #footer="{ collapsed }">
      <DashboardUserMenu :collapsed="collapsed" />
    </template>
  </UDashboardSidebar>
</template>
