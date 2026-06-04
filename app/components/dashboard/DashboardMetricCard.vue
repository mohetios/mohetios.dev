<script setup lang="ts">
import type { DashboardMetric } from '~/data/dashboard.mock'
import { dashboardCardUi } from '~/utils/dashboard-ui'

defineProps<{
  metric: DashboardMetric
}>()
</script>

<template>
  <UCard variant="outline" :ui="dashboardCardUi">
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

        <div class="mt-2 flex items-center gap-2 text-xs">
          <span
            v-if="metric.trend"
            class="font-medium"
            :class="{
              'text-primary': metric.trendDirection === 'up',
              'text-red-600 dark:text-red-400': metric.trendDirection === 'down',
              'text-muted': metric.trendDirection === 'neutral'
            }"
          >
            <span v-if="metric.trendDirection === 'up'">↑</span>
            <span v-else-if="metric.trendDirection === 'down'">↓</span>
            {{ metric.trend }}
          </span>

          <span v-else class="text-muted">—</span>

          <span class="text-muted">{{ metric.helper }}</span>
        </div>
      </div>
    </div>
  </UCard>
</template>
