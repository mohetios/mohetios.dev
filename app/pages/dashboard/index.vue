<script setup lang="ts">
import {
  audienceData,
  audienceSummary,
  contentPulseItems,
  dashboardMetrics,
  inboxPreviewItems,
  readerSignals,
  recentActivityItems,
  systemHealth
} from '~/data/dashboard.mock'
import { dashboardCardUi } from '~/utils/dashboard-ui'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

const { t } = useI18n()

useMohetSeo({
  title: () => t('dashboard.overview.title'),
  description: () => t('dashboard.overview.description')
})

const safeAudienceData = computed(() => audienceData.length ? audienceData : [{ label: '', value: 0 }])

const maxAudienceValue = computed(() => {
  const max = Math.max(...safeAudienceData.value.map((item) => item.value))
  return max > 0 ? max : 1
})

function getPointStyle(value: number, index: number) {
  const total = safeAudienceData.value.length
  const x = total <= 1 ? 0 : (index / (total - 1)) * 100
  const y = 100 - (value / maxAudienceValue.value) * 80

  return `${x},${y}`
}

const audiencePolyline = computed(() =>
  safeAudienceData.value.map((item, index) => getPointStyle(item.value, index)).join(' ')
)

const audienceAreaPoints = computed(() => {
  const points = safeAudienceData.value
    .map((item, index) => getPointStyle(item.value, index))
    .join(' ')

  return `0,100 ${points} 100,100`
})

const activityIconClass: Record<string, string> = {
  primary: 'text-blue-600 dark:text-blue-400',
  success: 'text-emerald-600 dark:text-emerald-400',
  warning: 'text-amber-600 dark:text-amber-400',
  error: 'text-red-600 dark:text-red-400',
  neutral: 'text-muted'
}
</script>

<template>
  <div class="mx-auto max-w-7xl space-y-6">
    <section class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="text-3xl font-semibold tracking-tight text-highlighted">
          {{ t('dashboard.overview.title') }}
        </h1>
        <p class="mt-1 text-sm text-muted">
          {{ t('dashboard.overview.description') }}
        </p>
      </div>

      <div class="flex items-center gap-2">
        <UButton
          color="neutral"
          variant="outline"
          icon="i-lucide-inbox"
          to="/dashboard/inbox"
        >
          {{ t('dashboard.overview.openInbox') }}
        </UButton>
      </div>
    </section>

    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <DashboardMetricCard
        v-for="metric in dashboardMetrics"
        :key="metric.key"
        :metric="metric"
      />
    </section>

    <section class="grid gap-4 xl:grid-cols-5">
      <UCard
        variant="outline"
        :ui="dashboardCardUi"
        class="flex flex-col xl:col-span-3"
      >
        <template #header>
          <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 class="text-base font-semibold text-highlighted">
                {{ t('dashboard.overview.audience') }}
              </h2>
              <div class="mt-3 flex items-center gap-2">
                <p class="text-2xl font-semibold text-highlighted">
                  {{ audienceSummary.value }}
                </p>
                <span
                  v-if="audienceSummary.trend"
                  class="text-sm font-medium text-blue-600 dark:text-blue-400"
                >
                  <span v-if="audienceSummary.trendDirection === 'up'">↑</span>
                  <span v-else-if="audienceSummary.trendDirection === 'down'">↓</span>
                  {{ audienceSummary.trend }}
                </span>
              </div>
              <p class="mt-1 text-sm text-muted">
                {{ t(audienceSummary.helperKey) }}
              </p>
            </div>

            <UButton
              color="neutral"
              variant="outline"
              trailing-icon="i-lucide-chevron-down"
              class="shrink-0"
            >
              {{ t('dashboard.overview.visitors') }}
            </UButton>
          </div>
        </template>

        <div class="h-64 min-h-48">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            class="h-full w-full"
            role="img"
            :aria-label="t('dashboard.overview.audienceChartLabel')"
          >
            <line
              v-for="y in [20, 40, 60, 80]"
              :key="y"
              x1="0"
              :y1="y"
              x2="100"
              :y2="y"
              class="stroke-neutral-200 dark:stroke-neutral-700"
              stroke-width="0.4"
            />

            <polygon
              :points="audienceAreaPoints"
              class="fill-blue-500/10 dark:fill-blue-400/10"
            />

            <polyline
              :points="audiencePolyline"
              fill="none"
              class="stroke-blue-600 dark:stroke-blue-400"
              stroke-width="1.3"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>

        <div class="mt-3 grid grid-cols-7 gap-1 text-xs text-muted">
          <span v-for="item in safeAudienceData" :key="item.label" class="truncate">
            {{ item.label }}
          </span>
        </div>
      </UCard>

      <DashboardInboxPreviewCard class="xl:col-span-2" :items="inboxPreviewItems" />
    </section>

    <section class="grid items-stretch gap-4 lg:grid-cols-2 xl:grid-cols-3">
      <DashboardContentPulseCard :items="contentPulseItems" />
      <DashboardReaderSignalsCard :signals="readerSignals" />
      <DashboardSystemHealthCard :health="systemHealth" />
    </section>

    <section class="grid gap-4 lg:grid-cols-3">
      <UCard
        variant="outline"
        :ui="dashboardCardUi"
        class="lg:col-span-2"
      >
        <template #header>
          <h2 class="text-base font-semibold text-highlighted">
            {{ t('dashboard.overview.recentActivity') }}
          </h2>
        </template>

        <div class="grid gap-4 md:grid-cols-2">
          <div
            v-for="item in recentActivityItems"
            :key="item.id"
            class="flex items-start gap-3"
          >
            <div class="flex size-9 items-center justify-center rounded-full bg-muted/60">
              <UIcon
                :name="item.icon"
                class="size-5"
                :class="activityIconClass[item.color] || activityIconClass.neutral"
              />
            </div>

            <div class="min-w-0">
              <p class="text-sm font-medium text-highlighted">
                {{ item.title }}
              </p>
              <p class="mt-1 text-xs text-muted">
                {{ item.time }}
              </p>
            </div>
          </div>
        </div>
      </UCard>

      <UCard
        variant="outline"
        :ui="{
          ...dashboardCardUi,
          footer: 'border-t border-default px-4 py-3 sm:px-5'
        }"
      >
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-base font-semibold text-highlighted">
              {{ t('dashboard.overview.quickNote') }}
            </h2>
            <UButton
              icon="i-lucide-pencil"
              color="neutral"
              variant="ghost"
              size="xs"
            />
          </div>
        </template>

        <div
          class="min-h-24 rounded-xl border border-dashed border-muted px-3 py-3 text-sm text-muted"
        >
          {{ t('dashboard.overview.quickNotePlaceholder') }}
        </div>

        <template #footer>
          <UButton
            color="neutral"
            variant="ghost"
            size="sm"
            icon="i-lucide-plus"
          >
            {{ t('dashboard.overview.addQuickNote') }}
          </UButton>
        </template>
      </UCard>
    </section>
  </div>
</template>
