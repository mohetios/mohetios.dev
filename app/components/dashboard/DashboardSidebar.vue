<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()

const navItems = computed(() => [
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
  {
    label: t('dashboard.nav.comments'),
    icon: 'i-lucide-message-square',
    to: '/dashboard/comments'
  },
  {
    label: t('dashboard.nav.forms'),
    icon: 'i-lucide-clipboard-list',
    to: '/dashboard/forms'
  },
  {
    label: t('dashboard.nav.analytics'),
    icon: 'i-lucide-chart-column',
    to: '/dashboard/analytics'
  }
])

function isActive(path: string) {
  if (path === '/dashboard') {
    return route.path === '/dashboard'
  }

  return route.path.startsWith(path)
}
</script>

<template>
  <UDashboardSidebar
    collapsible
    class="border-e border-default bg-default"
    :ui="{ body: 'p-3', footer: 'border-t border-default p-2' }"
  >
    <template #header="{ collapsed }">
      <NuxtLink
        to="/dashboard"
        class="flex h-16 items-center px-2 text-2xl font-semibold tracking-tight text-highlighted"
        :class="collapsed ? 'justify-center px-0' : ''"
      >
        <span v-if="collapsed" class="text-lg">M</span>
        <span v-else>Mohetios</span>
      </NuxtLink>
    </template>

    <template #default="{ collapsed }">
      <nav class="space-y-1">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition"
          :class="[
            isActive(item.to)
              ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300'
              : 'text-muted hover:bg-muted/50 hover:text-highlighted',
            collapsed ? 'justify-center px-2' : ''
          ]"
        >
          <span class="flex items-center gap-3" :class="collapsed ? 'gap-0' : ''">
            <UIcon :name="item.icon" class="size-5 shrink-0" />
            <span v-if="!collapsed" class="font-medium">{{ item.label }}</span>
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
        </NuxtLink>
      </nav>
    </template>

    <template #footer="{ collapsed }">
      <DashboardUserMenu :collapsed="collapsed" />
    </template>
  </UDashboardSidebar>
</template>
