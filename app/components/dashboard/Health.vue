<script setup lang="ts">
import type { DashboardHome } from '~/composables/useDashboardHome'

defineProps<{
  items: DashboardHome['systemHealth']
  loading?: boolean
}>()

const { t } = useI18n()

const statusColor = {
  ok: 'success',
  pending: 'warning',
  error: 'error',
  offline: 'error'
} as const

function statusLabel(status: string) {
  if (status === 'ok') return t('dashboard.home.systemHealth.ok')
  if (status === 'pending') return t('dashboard.home.systemHealth.pending')
  if (status === 'error' || status === 'offline') return t('dashboard.home.systemHealth.error')
  return status
}
</script>

<template>
  <DashboardSection
    :title="t('dashboard.overview.systemHealth')"
    to="/dashboard/analytics"
    :link-label="t('dashboard.overview.viewDetails')"
    class="h-full"
  >
    <div v-if="loading" class="space-y-3">
      <USkeleton v-for="index in 3" :key="index" class="h-12 w-full" />
    </div>

    <ul v-else class="space-y-2">
      <li
        v-for="item in items"
        :key="item.key"
        class="flex items-start justify-between gap-3 rounded-xl border border-default bg-muted/20 px-3 py-2.5"
      >
        <div class="min-w-0">
          <p class="text-sm font-medium text-highlighted">
            {{ item.label }}
          </p>
          <p class="mt-0.5 text-xs text-muted">
            {{ item.helper }}
          </p>
        </div>

        <UBadge
          :color="statusColor[item.status as keyof typeof statusColor] || 'neutral'"
          variant="soft"
          size="xs"
          class="shrink-0 rounded-full"
        >
          {{ statusLabel(item.status) }}
        </UBadge>
      </li>
    </ul>
  </DashboardSection>
</template>
