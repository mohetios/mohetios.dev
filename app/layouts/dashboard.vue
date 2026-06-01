<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const auth = useAuth()

const dashboardNavigation = computed(() => [
  {
    label: 'Overview',
    icon: 'i-lucide-layout-dashboard',
    to: localePath('/dashboard')
  },
  {
    label: 'Leads',
    icon: 'i-lucide-users',
    to: localePath('/dashboard/leads')
  },
  {
    label: 'Inbox',
    icon: 'i-lucide-mail',
    to: localePath('/dashboard/inbox')
  },
  {
    label: 'Comments',
    icon: 'i-lucide-message-square',
    to: localePath('/dashboard/comments')
  },
  {
    label: 'Forms',
    icon: 'i-lucide-file-text',
    to: localePath('/dashboard/forms')
  },
  {
    label: 'Analytics',
    icon: 'i-lucide-chart-column',
    to: localePath('/dashboard/analytics')
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

const accountLabel = computed(
  () => auth.user.value?.username || 'Dashboard user'
)
const accountDescription = computed(() => auth.user.value?.role || t('dashboard.role'))
const backToSiteLabel = computed(() => t('dashboard.backToSite'))
const accountMenuItems = computed(() => [
  [
    {
      label: accountLabel.value,
      icon: 'i-lucide-user',
      disabled: true
    },
    {
      label: backToSiteLabel.value,
      icon: 'i-lucide-house',
      to: localePath('/')
    },
    {
      label: t('auth.logout'),
      icon: 'i-lucide-log-out',
      onSelect: logout
    }
  ]
])

async function logout() {
  await auth.logout()
  await navigateTo(localePath('/login'))
}
</script>

<template>
  <UDashboardGroup storage-key="mohetios-dashboard" class="min-h-screen bg-default">
    <UDashboardSearch :groups="searchGroups" />

    <UDashboardSidebar
      collapsible
      resizable
      :default-size="18"
      :min-size="14"
      :max-size="22"
      :collapsed-size="4"
      :ui="{
        root: 'border-e border-default bg-muted/20',
        header: 'gap-3 px-3 py-4',
        body: 'gap-4 px-3 py-2',
        footer: 'gap-3 px-3 py-4'
      }"
    >
      <template #header="{ collapsed }">
        <div class="flex min-w-0 items-center justify-between gap-2">
          <NuxtLink
            :to="localePath('/dashboard')"
            class="flex min-w-0 items-center gap-3"
            :aria-label="t('dashboard.title')"
          >
            <span
              class="flex size-8 shrink-0 items-center justify-center rounded-md border border-default bg-default text-sm font-semibold text-highlighted"
            >
              M
            </span>
            <span v-if="!collapsed" class="min-w-0">
              <span class="logo-mark block truncate text-xl font-semibold tracking-normal">
                Mohetios
              </span>
              <span class="block truncate text-xs text-muted">{{ t('dashboard.title') }}</span>
            </span>
          </NuxtLink>
        </div>
      </template>

      <template #default="{ collapsed }">
        <p v-if="!collapsed" class="px-2 text-xs font-medium uppercase tracking-wide text-muted">
          Workspace
        </p>

        <UNavigationMenu
          :items="dashboardNavigation"
          orientation="vertical"
          variant="link"
          :collapsed="collapsed"
          class="-mx-2"
        />
      </template>

      <template #footer="{ collapsed }">
     

        <UDropdownMenu :items="accountMenuItems">
          <UButton
            color="neutral"
            variant="ghost"
            :square="collapsed"
            class="w-full min-w-0 justify-start"
          >
            <UUser
              v-if="!collapsed"
              :name="accountLabel"
              :description="accountDescription"
              :avatar="{ alt: accountLabel }"
              size="sm"
              class="min-w-0"
            />
            <UAvatar v-else :alt="accountLabel" size="xs" />
          </UButton>
        </UDropdownMenu>
      </template>
    </UDashboardSidebar>

    <slot />
  </UDashboardGroup>
</template>
