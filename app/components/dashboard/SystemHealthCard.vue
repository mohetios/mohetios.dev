<script setup lang="ts">
import type { SystemHealthData } from '~/data/dashboard.mock'

defineProps<{
  health: SystemHealthData
}>()

const { t } = useI18n()

const serviceStatusColor = {
  Active: 'success',
  Warning: 'warning',
  Offline: 'error'
} as const
</script>

<template>
  <DashboardSectionCard
    :title="t('dashboard.overview.systemHealth')"
    to="/dashboard/analytics"
    :link-label="t('dashboard.overview.viewDetails')"
    class="h-full"
  >
    <div class="space-y-4">
      <div class="flex items-center gap-2">
        <span class="size-2 rounded-full bg-emerald-500" />
        <p class="text-sm font-medium text-highlighted">
          {{ health.status }}
        </p>
      </div>

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div
          v-for="metric in health.metrics"
          :key="metric.label"
          class="rounded-xl border border-default bg-muted/30 p-3"
        >
          <div class="flex items-center gap-1.5 text-xs text-muted">
            <UIcon :name="metric.icon" class="size-3.5" />
            {{ metric.label }}
          </div>
          <p class="mt-1 text-sm font-semibold text-highlighted">
            {{ metric.value }}
          </p>
          <p class="mt-0.5 text-xs text-primary">
            ↑ {{ metric.trend }}
          </p>
        </div>
      </div>

      <div class="flex flex-wrap gap-2">
        <div
          v-for="vital in health.webVitals"
          :key="vital.label"
          class="rounded-lg border border-default bg-muted/20 px-3 py-2"
        >
          <p class="text-xs text-muted">{{ vital.label }}</p>
          <p class="text-sm font-semibold text-highlighted">{{ vital.value }}</p>
          <UBadge color="success" variant="soft" size="xs" class="mt-1 rounded-full">
            {{ vital.status }}
          </UBadge>
        </div>
      </div>

      <ul class="space-y-2 border-t border-default pt-3">
        <li
          v-for="service in health.services"
          :key="service.label"
          class="flex items-center justify-between text-sm"
        >
          <span class="text-muted">{{ service.label }}</span>
          <UBadge
            :color="serviceStatusColor[service.status]"
            variant="soft"
            size="xs"
            class="rounded-full"
          >
            {{ service.status }}
          </UBadge>
        </li>
      </ul>
    </div>
  </DashboardSectionCard>
</template>
