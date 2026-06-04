<script setup lang="ts">
const { t } = useI18n()

const rangeItems = computed(() => [
  [
    { label: t('dashboard.topbar.range24h'), value: '24h' },
    { label: t('dashboard.topbar.range7d'), value: '7d' },
    { label: t('dashboard.topbar.range30d'), value: '30d' }
  ]
])
</script>

<template>
  <UDashboardNavbar class="border-b border-default bg-default/90 backdrop-blur">
    <template #left>
      <UDashboardSidebarCollapse class="shrink-0 lg:hidden" />

      <UInput
        icon="i-lucide-search"
        :placeholder="t('dashboard.topbar.search')"
        size="md"
        class="w-72 max-w-full"
        :ui="{ trailing: 'pointer-events-none' }"
      >
        <template #trailing>
          <span class="text-xs text-muted">⌘K</span>
        </template>
      </UInput>
    </template>

    <template #right>
      <UDropdownMenu :items="rangeItems">
        <UButton
          color="neutral"
          variant="outline"
          icon="i-lucide-calendar"
          trailing-icon="i-lucide-chevron-down"
        >
          {{ t('dashboard.topbar.range7d') }}
        </UButton>
      </UDropdownMenu>

      <UButton
        color="primary"
        icon="i-lucide-plus"
        to="/blog"
      >
        {{ t('dashboard.topbar.newPost') }}
      </UButton>

      <UColorModeButton color="neutral" variant="ghost" />
    </template>
  </UDashboardNavbar>
</template>
