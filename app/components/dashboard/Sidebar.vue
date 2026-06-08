<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()

type DashboardNavItem = {
  label: string
  icon: string
  to: string
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
    to: '/dashboard/inbox'
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
          class="site-logo-link min-w-0"
          :class="collapsed ? 'justify-center' : ''"
          :aria-label="`${t('site.name')} ${t('dashboard.title')}`"
        >
          <span
            v-if="collapsed"
            class="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-base font-bold text-primary"
          >
            {{ t('site.logo.part1').charAt(0) }}
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
          class="group flex min-h-10 items-center rounded-xl px-3 py-2 text-sm transition"
          :class="[
            isActive(item.to)
              ? 'bg-primary/10 text-primary'
              : 'text-muted hover:bg-neutral-100 hover:text-highlighted dark:hover:bg-neutral-900',
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
        </NuxtLink>
      </nav>
    </template>

    <template #footer="{ collapsed }">
      <DashboardUserMenu :collapsed="collapsed" />
    </template>
  </UDashboardSidebar>
</template>
