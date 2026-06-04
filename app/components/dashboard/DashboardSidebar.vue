<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()

type DashboardNavItem = {
  label: string
  icon: string
  to: string
  badge?: string
}

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
    badge: '8'
  },
  {
    label: t('dashboard.nav.leads'),
    icon: 'i-lucide-users',
    to: '/dashboard/leads'
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
  },
  {
    label: t('dashboard.nav.system'),
    icon: 'i-lucide-server',
    to: '/dashboard/system'
  },
  {
    label: t('dashboard.nav.settings'),
    icon: 'i-lucide-settings',
    to: '/dashboard/settings'
  }
])

function stripLocale(path: string) {
  return path.replace(/^\/(en|fa)(?=\/|$)/, '') || '/'
}

const currentPath = computed(() => stripLocale(route.path))

function isActive(path: string) {
  if (path === '/dashboard') {
    return currentPath.value === '/dashboard'
  }

  return currentPath.value === path || currentPath.value.startsWith(`${path}/`)
}
</script>

<template>
  <UDashboardSidebar
    collapsible
    class="border-e border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950"
    :ui="{
      header: 'border-b border-neutral-200 p-3 dark:border-neutral-800',
      body: 'p-3',
      footer: 'border-t border-neutral-200 p-2 dark:border-neutral-800'
    }"
  >
    <template #header="{ collapsed }">
      <div
        class="flex h-14 items-center gap-2"
        :class="collapsed ? 'justify-center' : 'justify-between'"
      >
        <NuxtLink
          to="/dashboard"
          class="flex min-w-0 items-center text-xl font-semibold tracking-tight text-highlighted"
          :class="collapsed ? 'justify-center' : ''"
          aria-label="Mohetios dashboard"
        >
          <span
            v-if="collapsed"
            class="flex size-9 items-center justify-center rounded-xl bg-blue-500/10 text-base font-semibold text-blue-700 dark:text-blue-300"
          >
            M
          </span>
          <span v-else class="truncate">
            Mohetios
          </span>
        </NuxtLink>

        <UDashboardSidebarCollapse
          v-if="!collapsed"
          color="neutral"
          variant="ghost"
          size="sm"
        />
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
              ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300'
              : 'text-muted hover:bg-neutral-100 hover:text-highlighted dark:hover:bg-neutral-900',
            collapsed ? 'justify-center px-2' : 'justify-between'
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

          <UBadge
            v-if="item.badge && !collapsed"
            color="primary"
            variant="soft"
            size="xs"
            class="rounded-full"
          >
            {{ item.badge }}
          </UBadge>

          <span
            v-if="item.badge && collapsed"
            class="absolute right-2 top-2 size-2 rounded-full bg-blue-500"
            aria-hidden="true"
          />
        </NuxtLink>
      </nav>
    </template>

    <template #footer="{ collapsed }">
      <DashboardUserMenu :collapsed="collapsed" />
    </template>
  </UDashboardSidebar>
</template>
