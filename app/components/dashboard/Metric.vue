<script setup lang="ts">
import { dashboardCardUi } from '~/utils/dashboard-ui'

export type DashboardSummaryCard = {
  key: string
  label: string
  value: number | string
  valueLabel?: string
  icon: string
  helper: string
  to?: string
  stats?: {
    label: string
    value: number | string
  }[]
}

const props = defineProps<{
  metric: DashboardSummaryCard
}>()

const pairedStat = computed(() => props.metric.stats?.length === 1 ? props.metric.stats[0] : null)
const primaryLabel = computed(() => props.metric.valueLabel ?? props.metric.label)
</script>

<template>
  <UCard variant="outline" :ui="dashboardCardUi">
    <component :is="metric.to ? 'NuxtLink' : 'div'" :to="metric.to" class="block">
      <div class="flex items-start gap-4">
        <div class="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <UIcon :name="metric.icon" class="size-5" />
        </div>

        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium text-muted">
            {{ metric.label }}
          </p>

          <div v-if="pairedStat" class="mt-2">
            <div class="flex min-w-0 items-baseline gap-2">
              <span class="text-3xl font-semibold tracking-tight text-highlighted">
                {{ metric.value }}
              </span>
              <span class="text-lg font-medium text-muted">
                /
              </span>
              <span class="text-2xl font-semibold tracking-tight text-highlighted">
                {{ pairedStat.value }}
              </span>
            </div>

            <div class="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-muted">
              <span class="min-w-0 truncate">
                {{ primaryLabel }}
              </span>
              <span aria-hidden="true" class="shrink-0">
                /
              </span>
              <span class="min-w-0 truncate">
                {{ pairedStat.label }}
              </span>
            </div>
          </div>

          <p v-else class="mt-1 text-3xl font-semibold tracking-tight text-highlighted">
            {{ metric.value }}
          </p>

          <p class="mt-2 text-xs text-muted">
            {{ metric.helper }}
          </p>

          <dl v-if="metric.stats?.length && !pairedStat" class="mt-4 grid gap-2 sm:grid-cols-2">
            <div
              v-for="stat in metric.stats"
              :key="stat.label"
              class="rounded-md border border-default px-2.5 py-2"
            >
              <dt class="truncate text-xs text-muted">
                {{ stat.label }}
              </dt>
              <dd class="mt-0.5 text-sm font-semibold text-highlighted">
                {{ stat.value }}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </component>
  </UCard>
</template>
