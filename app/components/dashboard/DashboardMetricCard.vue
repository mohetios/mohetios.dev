<script setup lang="ts">
import { dashboardCardUi } from '~/utils/dashboard-ui'

export type DashboardSummaryCard = {
  key: string
  label: string
  value: number | string
  icon: string
  helper: string
  to?: string
}

defineProps<{
  metric: DashboardSummaryCard
}>()
</script>

<template>
  <UCard variant="outline" :ui="dashboardCardUi">
    <component :is="metric.to ? 'NuxtLink' : 'div'" :to="metric.to" class="block">
      <div class="flex items-start gap-4">
        <div
          class="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary"
        >
          <UIcon :name="metric.icon" class="size-5" />
        </div>

        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium text-muted">
            {{ metric.label }}
          </p>

          <p class="mt-1 text-3xl font-semibold tracking-tight text-highlighted">
            {{ metric.value }}
          </p>

          <p class="mt-2 text-xs text-muted">
            {{ metric.helper }}
          </p>
        </div>
      </div>
    </component>
  </UCard>
</template>
