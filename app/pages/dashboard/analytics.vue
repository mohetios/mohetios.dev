<script setup lang="ts">
import {
  dashboardCardUi,
  dashboardChartCardMinHeightClass,
  dashboardChartCardUi,
  dashboardChartStandaloneHeightClass
} from '~/utils/dashboard-ui'
import type { AnalyticsRange } from '~/composables/useAnalyticsDashboard'
import type { AudienceMetricMode } from '~/utils/dashboard-charts'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

const { t } = useI18n()
const toast = useToast()

useMohetSeo({
  title: () => t('dashboard.analytics.title'),
  description: () => t('dashboard.analytics.description')
})

type AnalyticsTab = 'overview' | 'content' | 'search' | 'referrers' | 'performance'

const activeTab = ref<AnalyticsTab>('overview')
const search = ref('')

const range = ref<AnalyticsRange>('LAST_7_DAYS')
const audienceMetric = ref<AudienceMetricMode>('both')
const isRefreshing = ref(false)

const { data: analytics, pending: isLoading, error, refresh } = await useAnalyticsDashboard(range)

const tabItems = computed(() => [
  {
    label: t('dashboard.analytics.tabs.overview'),
    value: 'overview',
    icon: 'i-lucide-layout-dashboard'
  },
  { label: t('dashboard.analytics.tabs.content'), value: 'content', icon: 'i-lucide-file-text' },
  { label: t('dashboard.analytics.tabs.search'), value: 'search', icon: 'i-lucide-search' },
  { label: t('dashboard.analytics.tabs.referrers'), value: 'referrers', icon: 'i-lucide-share-2' },
  { label: t('dashboard.analytics.tabs.performance'), value: 'performance', icon: 'i-lucide-gauge' }
])

const rangeItems = computed(() => [
  { label: t('dashboard.analytics.ranges.last7Days'), value: 'LAST_7_DAYS' as const },
  { label: t('dashboard.analytics.ranges.last30Days'), value: 'LAST_30_DAYS' as const },
  { label: t('dashboard.analytics.ranges.last90Days'), value: 'LAST_90_DAYS' as const }
])

const audienceMetricItems = computed(() => [
  { label: t('dashboard.analytics.chartMetrics.visitors'), value: 'visitors' as const },
  { label: t('dashboard.analytics.chartMetrics.pageViews'), value: 'pageViews' as const },
  { label: t('dashboard.analytics.chartMetrics.both'), value: 'both' as const }
])

type BadgeColor = 'primary' | 'info' | 'success' | 'neutral' | 'warning' | 'error'

function getSourceColor(source: string): BadgeColor {
  return (
    (
      {
        Direct: 'neutral',
        Search: 'primary',
        Social: 'info',
        Referral: 'success',
        Newsletter: 'warning'
      } satisfies Record<string, BadgeColor>
    )[source] || 'neutral'
  )
}

function getVitalColor(status: string): BadgeColor {
  return (
    (
      {
        Good: 'success',
        'Needs improvement': 'warning',
        Poor: 'error',
        Pending: 'neutral'
      } satisfies Record<string, BadgeColor>
    )[status] || 'neutral'
  )
}

function formatNumber(value: number) {
  return new Intl.NumberFormat().format(value)
}

const topPageChartItems = computed(() =>
  analytics.value.topPages.slice(0, 8).map((page) => ({
    label: page.title || page.path,
    value: page.views,
    helper: page.path
  }))
)

const referrerChartItems = computed(() =>
  analytics.value.referrers.map((item) => ({
    label: item.source,
    value: item.visits,
    share: item.share,
    helper: `${item.share}%`
  }))
)

const countryChartItems = computed(() =>
  analytics.value.countries.map((item) => ({
    label: item.country,
    value: item.visits,
    share: item.share,
    code: item.code,
    helper: `${item.share}%`
  }))
)

const edgeStatItems = computed(() => [
  {
    key: 'cacheHitRatio',
    label: t('dashboard.analytics.sections.cacheEfficiency'),
    value: analytics.value.edgeSummary.cacheHitRatio,
    icon: 'i-lucide-database'
  },
  {
    key: 'edgeRequests',
    label: t('dashboard.analytics.sections.edgeRequests'),
    value: analytics.value.edgeSummary.edgeRequests,
    icon: 'i-lucide-globe'
  },
  {
    key: 'edgeErrors',
    label: t('dashboard.analytics.sections.edgeErrors'),
    value: analytics.value.edgeSummary.edgeErrors,
    icon: 'i-lucide-triangle-alert'
  }
])

const totalPageViews = computed(() =>
  analytics.value.trend.reduce((total, point) => total + point.pageViews, 0)
)

const hasAnalyticsData = computed(
  () =>
    analytics.value.metrics.length > 0 ||
    analytics.value.trend.length > 0 ||
    analytics.value.topPages.length > 0 ||
    analytics.value.referrers.length > 0 ||
    analytics.value.countries.length > 0 ||
    analytics.value.searchQueries.length > 0 ||
    analytics.value.webVitals.length > 0 ||
    analytics.value.dataSourceDescription.length > 0
)
const isInitialAnalyticsLoading = computed(() => isLoading.value && !hasAnalyticsData.value)

const filteredPages = computed(() => {
  const query = search.value.trim().toLowerCase()

  if (!query) {
    return analytics.value.topPages
  }

  return analytics.value.topPages.filter((page) =>
    [page.title, page.path].join(' ').toLowerCase().includes(query)
  )
})

const totalSearchClicks = computed(() =>
  analytics.value.searchQueries.reduce((total, item) => total + item.clicks, 0)
)

const totalSearchImpressions = computed(() =>
  analytics.value.searchQueries.reduce((total, item) => total + item.impressions, 0)
)

const searchCtr = computed(() => {
  if (!totalSearchImpressions.value) return '0%'
  return `${((totalSearchClicks.value / totalSearchImpressions.value) * 100).toFixed(1)}%`
})

const avgSearchPosition = computed(() => {
  if (!analytics.value.searchQueries.length) return '—'

  const sum = analytics.value.searchQueries.reduce(
    (total, item) => total + Number(item.position || 0),
    0
  )

  return (sum / analytics.value.searchQueries.length).toFixed(1)
})

const searchKpis = computed(() => [
  {
    key: 'clicks',
    label: t('dashboard.analytics.search.clicks'),
    value: formatNumber(totalSearchClicks.value),
    icon: 'i-lucide-mouse-pointer-click'
  },
  {
    key: 'impressions',
    label: t('dashboard.analytics.search.impressions'),
    value: formatNumber(totalSearchImpressions.value),
    icon: 'i-lucide-eye'
  },
  {
    key: 'ctr',
    label: t('dashboard.analytics.search.ctr'),
    value: searchCtr.value,
    icon: 'i-lucide-percent'
  },
  {
    key: 'position',
    label: t('dashboard.analytics.search.avgPosition'),
    value: avgSearchPosition.value,
    icon: 'i-lucide-trending-up'
  }
])

async function refreshAnalytics() {
  try {
    await withDashboardRefresh(isRefreshing, () => refresh())

    toast.add({
      color: 'success',
      icon: 'i-lucide-refresh-cw',
      title: t('dashboard.analytics.refreshSuccess')
    })
  } catch (currentError) {
    toast.add({
      color: 'error',
      icon: 'i-lucide-circle-alert',
      title:
        currentError instanceof Error
          ? currentError.message
          : t('dashboard.analytics.refreshFailed')
    })
  }
}

watch(error, (currentError) => {
  if (!currentError || import.meta.server) return

  toast.add({
    color: 'error',
    icon: 'i-lucide-circle-alert',
    title:
      currentError instanceof Error ? currentError.message : t('dashboard.analytics.refreshFailed')
  })
})
</script>

<template>
  <div class="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
    <section class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div class="flex min-w-0 items-start gap-3">
        <div>
          <h1 class="text-3xl font-semibold tracking-tight text-highlighted">
            {{ t('dashboard.analytics.title') }}
          </h1>
          <p class="mt-1 text-sm text-muted">
            {{ t('dashboard.analytics.description') }}
          </p>
        </div>
      </div>

      <div class="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <UFieldGroup size="sm" class="w-full sm:w-auto">
          <UButton
            v-for="item in rangeItems"
            :key="item.value"
            :variant="range === item.value ? 'soft' : 'outline'"
            color="primary"
            icon="i-lucide-calendar"
            @click="range = item.value"
          >
            {{ item.label }}
          </UButton>
        </UFieldGroup>

        <div class="flex items-center gap-2">
          <UButton
            color="neutral"
            variant="ghost"
            :disabled="isRefreshing"
            @click="refreshAnalytics"
          >
            <template #leading>
              <UIcon
                :name="isRefreshing ? 'i-lucide-loader-circle' : 'i-lucide-refresh-cw'"
                class="size-4"
                :class="{ 'animate-spin': isRefreshing }"
              />
            </template>
            {{ t('dashboard.analytics.refresh') }}
          </UButton>
        </div>
      </div>
    </section>

    <section v-if="isInitialAnalyticsLoading" class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <USkeleton v-for="item in 4" :key="item" class="h-28 w-full rounded-2xl" />
    </section>

    <section v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <DashboardMetric v-for="metric in analytics.metrics" :key="metric.key" :metric="metric" />
    </section>

    <UTabs
      v-model="activeTab"
      :items="tabItems"
      :content="false"
      color="primary"
      variant="link"
      class="w-full"
    />

    <!-- Overview tab -->
    <div v-if="activeTab === 'overview'" class="space-y-4">
      <section class="grid items-stretch gap-4 xl:grid-cols-5">
        <UCard
          variant="outline"
          :ui="dashboardChartCardUi"
          :class="[dashboardChartCardMinHeightClass, 'xl:col-span-3']"
        >
          <template #header>
            <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 class="text-base font-semibold text-highlighted">
                  {{ t('dashboard.analytics.sections.audienceTrend') }}
                </h2>
                <p class="mt-1 text-sm text-muted">
                  {{ t('dashboard.analytics.sections.audienceTrendDescription') }}
                </p>
              </div>
              <div class="flex flex-col items-end gap-2">
                <UFieldGroup size="xs">
                  <UButton
                    v-for="item in audienceMetricItems"
                    :key="item.value"
                    :variant="audienceMetric === item.value ? 'soft' : 'ghost'"
                    color="primary"
                    @click="audienceMetric = item.value"
                  >
                    {{ item.label }}
                  </UButton>
                </UFieldGroup>

                <div class="text-right">
                  <p class="text-2xl font-semibold text-highlighted">
                    {{ formatNumber(totalPageViews) }}
                  </p>
                  <p class="text-xs text-muted">
                    {{ t('dashboard.analytics.sections.pageViews') }}
                  </p>
                </div>
              </div>
            </div>
          </template>

          <DashboardAreaChart
            :points="analytics.trend"
            :metric="audienceMetric"
            :loading="isInitialAnalyticsLoading"
            :aria-label="t('dashboard.analytics.sections.audienceTrendDescription')"
          >
            <template #empty>
              {{ t('dashboard.home.audience.pending') }}
            </template>
          </DashboardAreaChart>
        </UCard>

        <UCard
          variant="outline"
          :ui="dashboardChartCardUi"
          :class="[dashboardChartCardMinHeightClass, 'xl:col-span-2']"
        >
          <template #header>
            <h2 class="text-base font-semibold text-highlighted">
              {{ t('dashboard.analytics.sections.topContentByViews') }}
            </h2>
          </template>

          <DashboardBarChart
            :items="topPageChartItems"
            :value-formatter="formatNumber"
            :label="t('dashboard.analytics.sections.pageViews')"
            :loading="isInitialAnalyticsLoading"
          >
            <template #empty>
              {{ t('dashboard.analytics.empty.topPages') }}
            </template>
          </DashboardBarChart>
        </UCard>
      </section>

      <section class="grid gap-4 lg:grid-cols-3">
        <UCard variant="outline" :ui="dashboardCardUi">
          <template #header>
            <h2 class="text-base font-semibold text-highlighted">
              {{ t('dashboard.analytics.sections.acquisitionMix') }}
            </h2>
          </template>

          <DashboardProgress
            :items="referrerChartItems"
            :value-formatter="formatNumber"
            :label="t('dashboard.analytics.sections.acquisitionMix')"
            :loading="isInitialAnalyticsLoading"
          >
            <template #empty>
              {{ t('dashboard.analytics.empty.referrers') }}
            </template>
          </DashboardProgress>
        </UCard>

        <UCard variant="outline" :ui="dashboardCardUi">
          <template #header>
            <h2 class="text-base font-semibold text-highlighted">
              {{ t('dashboard.analytics.sections.geoSignals') }}
            </h2>
          </template>

          <DashboardProgress
            :items="countryChartItems"
            :value-formatter="formatNumber"
            :label="t('dashboard.analytics.sections.geoSignals')"
            :loading="isInitialAnalyticsLoading"
          >
            <template #empty>
              {{ t('dashboard.analytics.empty.countries') }}
            </template>
          </DashboardProgress>
        </UCard>

        <UCard variant="outline" :ui="dashboardCardUi">
          <template #header>
            <h2 class="text-base font-semibold text-highlighted">
              {{ t('dashboard.analytics.sections.webVitals') }}
            </h2>
          </template>

          <ul class="space-y-3">
            <li
              v-for="vital in analytics.webVitals"
              :key="vital.key"
              class="flex items-center justify-between gap-3 rounded-xl border border-default bg-muted/20 px-3 py-2.5"
            >
              <div class="min-w-0">
                <p class="text-sm font-medium text-highlighted">{{ vital.key }}</p>
                <p class="truncate text-xs text-muted">{{ vital.label }}</p>
              </div>
              <div class="flex shrink-0 items-center gap-2">
                <span class="text-sm font-semibold text-highlighted">{{ vital.value }}</span>
                <UBadge
                  :color="getVitalColor(vital.status)"
                  variant="soft"
                  size="xs"
                  class="rounded-full"
                >
                  {{ vital.status }}
                </UBadge>
              </div>
            </li>
          </ul>
        </UCard>
      </section>
    </div>

    <!-- Content tab -->
    <div v-else-if="activeTab === 'content'" class="space-y-4">
      <UCard
        variant="outline"
        :ui="dashboardChartCardUi"
        :class="dashboardChartStandaloneHeightClass"
      >
        <template #header>
          <h2 class="text-base font-semibold text-highlighted">
            {{ t('dashboard.analytics.sections.topContentByViews') }}
          </h2>
        </template>

        <DashboardBarChart
          :items="topPageChartItems"
          :value-formatter="formatNumber"
          :label="t('dashboard.analytics.sections.pageViews')"
          :loading="isInitialAnalyticsLoading"
          :min-height="240"
        >
          <template #empty>
            {{ t('dashboard.analytics.empty.topPages') }}
          </template>
        </DashboardBarChart>
      </UCard>

      <section
        class="flex flex-col gap-3 rounded-2xl border border-default bg-default p-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h2 class="text-sm font-semibold text-highlighted">
            {{ t('dashboard.analytics.sections.topContent') }}
          </h2>
          <p class="text-xs text-muted">
            {{ filteredPages.length }} / {{ analytics.topPages.length }}
          </p>
        </div>
        <UInput
          v-model="search"
          icon="i-lucide-search"
          :placeholder="t('dashboard.analytics.search.placeholder')"
          class="w-full sm:w-72"
        />
      </section>

      <UCard variant="outline" :ui="{ ...dashboardCardUi, body: 'p-0' }">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr
                class="border-b border-default text-left text-xs uppercase tracking-wide text-muted"
              >
                <th class="px-4 py-3 font-medium">{{ t('dashboard.analytics.table.page') }}</th>
                <th class="px-4 py-3 font-medium">{{ t('dashboard.analytics.table.views') }}</th>
                <th class="px-4 py-3 font-medium">{{ t('dashboard.analytics.table.visitors') }}</th>
                <th class="px-4 py-3 font-medium">{{ t('dashboard.analytics.table.avgTime') }}</th>
                <th class="px-4 py-3 font-medium">
                  {{ t('dashboard.analytics.table.topSource') }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-default">
              <tr
                v-for="page in filteredPages"
                :key="page.path"
                class="transition hover:bg-muted/30"
              >
                <td class="px-4 py-3">
                  <p class="font-medium text-highlighted">{{ page.title }}</p>
                  <p class="text-xs text-muted">{{ page.path }}</p>
                </td>
                <td class="px-4 py-3 text-highlighted">{{ formatNumber(page.views) }}</td>
                <td class="px-4 py-3 text-muted">{{ formatNumber(page.visitors) }}</td>
                <td class="px-4 py-3 text-muted">{{ page.avgTime }}</td>
                <td class="px-4 py-3">
                  <UBadge
                    :color="getSourceColor(page.source)"
                    variant="soft"
                    size="xs"
                    class="rounded-full"
                  >
                    {{ page.source }}
                  </UBadge>
                </td>
              </tr>
              <tr v-if="!filteredPages.length">
                <td colspan="5" class="px-4 py-10 text-center text-sm text-muted">
                  {{
                    search.trim()
                      ? t('dashboard.analytics.empty.pageSearch')
                      : t('dashboard.analytics.empty.topPages')
                  }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </UCard>
    </div>

    <!-- Search tab -->
    <div v-else-if="activeTab === 'search'" class="space-y-4">
      <UCard variant="outline" :ui="dashboardCardUi" class="border-dashed">
        <div class="flex items-start gap-3">
          <UIcon name="i-lucide-info" class="mt-0.5 size-4 shrink-0 text-muted" />
          <div>
            <p class="text-sm font-medium text-highlighted">
              {{ t('dashboard.analytics.dataSources.searchConsolePendingTitle') }}
            </p>
            <p class="mt-1 text-sm text-muted">
              {{ t('dashboard.analytics.dataSources.searchConsolePendingDescription') }}
            </p>
          </div>
        </div>
      </UCard>

      <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <UCard v-for="kpi in searchKpis" :key="kpi.key" variant="outline" :ui="dashboardCardUi">
          <div class="flex items-center gap-3">
            <div
              class="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"
            >
              <UIcon :name="kpi.icon" class="size-5" />
            </div>
            <div>
              <p class="text-sm font-medium text-muted">{{ kpi.label }}</p>
              <p class="text-2xl font-semibold tracking-tight text-highlighted">{{ kpi.value }}</p>
            </div>
          </div>
        </UCard>
      </section>

      <UCard variant="outline" :ui="{ ...dashboardCardUi, body: 'p-0' }">
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-search" class="size-4 text-muted" />
            <h2 class="text-base font-semibold text-highlighted">
              {{ t('dashboard.analytics.sections.searchQueries') }}
            </h2>
          </div>
        </template>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr
                class="border-b border-default text-left text-xs uppercase tracking-wide text-muted"
              >
                <th class="px-4 py-3 font-medium">{{ t('dashboard.analytics.table.query') }}</th>
                <th class="px-4 py-3 font-medium">{{ t('dashboard.analytics.search.clicks') }}</th>
                <th class="px-4 py-3 font-medium">
                  {{ t('dashboard.analytics.search.impressions') }}
                </th>
                <th class="px-4 py-3 font-medium">{{ t('dashboard.analytics.search.ctr') }}</th>
                <th class="px-4 py-3 font-medium">{{ t('dashboard.analytics.table.position') }}</th>
                <th class="px-4 py-3 font-medium">{{ t('dashboard.analytics.table.page') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-default">
              <tr
                v-for="item in analytics.searchQueries"
                :key="item.query"
                class="transition hover:bg-muted/30"
              >
                <td class="px-4 py-3 font-medium text-highlighted">{{ item.query }}</td>
                <td class="px-4 py-3 text-highlighted">{{ formatNumber(item.clicks) }}</td>
                <td class="px-4 py-3 text-muted">{{ formatNumber(item.impressions) }}</td>
                <td class="px-4 py-3 text-muted">{{ item.ctr }}</td>
                <td class="px-4 py-3 text-muted">{{ item.position }}</td>
                <td class="px-4 py-3 text-xs text-muted">{{ item.page }}</td>
              </tr>
              <tr v-if="!analytics.searchQueries.length">
                <td colspan="6" class="px-4 py-10 text-center text-sm text-muted">
                  {{ t('dashboard.analytics.empty.searchQueries') }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </UCard>
    </div>

    <!-- Referrers tab -->
    <div v-else-if="activeTab === 'referrers'" class="space-y-4">
      <section class="grid gap-4 lg:grid-cols-2">
        <UCard variant="outline" :ui="dashboardCardUi">
          <template #header>
            <h2 class="text-base font-semibold text-highlighted">
              {{ t('dashboard.analytics.sections.topReferrers') }}
            </h2>
          </template>

          <DashboardProgress
            :items="referrerChartItems"
            :value-formatter="formatNumber"
            :label="t('dashboard.analytics.sections.acquisitionMix')"
            :loading="isInitialAnalyticsLoading"
          >
            <template #empty>
              {{ t('dashboard.analytics.empty.referrers') }}
            </template>
          </DashboardProgress>
        </UCard>

        <UCard variant="outline" :ui="dashboardCardUi">
          <template #header>
            <h2 class="text-base font-semibold text-highlighted">
              {{ t('dashboard.analytics.sections.topCountries') }}
            </h2>
          </template>

          <DashboardProgress
            :items="countryChartItems"
            :value-formatter="formatNumber"
            :label="t('dashboard.analytics.sections.geoSignals')"
            :loading="isInitialAnalyticsLoading"
          >
            <template #empty>
              {{ t('dashboard.analytics.empty.countries') }}
            </template>
          </DashboardProgress>
        </UCard>
      </section>
    </div>

    <!-- Performance tab -->
    <div v-else-if="activeTab === 'performance'" class="space-y-4">
      <section class="grid gap-4 md:grid-cols-3">
        <UCard
          v-for="vital in analytics.webVitals"
          :key="vital.key"
          variant="outline"
          :ui="dashboardCardUi"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm font-medium text-muted">{{ vital.key }}</p>
              <p class="mt-1 text-3xl font-semibold tracking-tight text-highlighted">
                {{ vital.value }}
              </p>
            </div>
            <UBadge
              :color="getVitalColor(vital.status)"
              variant="soft"
              size="sm"
              class="rounded-full"
            >
              {{ vital.status }}
            </UBadge>
          </div>
          <p class="mt-3 text-xs text-muted">{{ vital.label }}</p>
          <p class="mt-1 text-xs text-muted">{{ vital.helper }}</p>
        </UCard>
      </section>

      <section class="grid gap-4 lg:grid-cols-3">
        <UCard variant="outline" :ui="dashboardCardUi" class="lg:col-span-1">
          <template #header>
            <h2 class="text-base font-semibold text-highlighted">
              {{ t('dashboard.analytics.sections.pageLoadTime') }}
            </h2>
          </template>

          <div class="flex items-end gap-2">
            <p class="text-4xl font-semibold tracking-tight text-highlighted">
              {{ analytics.edgeSummary.avgLoadTime }}
            </p>

            <span
              v-if="analytics.edgeSummary.loadTimeTrend"
              class="pb-1 text-sm font-medium text-primary"
            >
              {{ analytics.edgeSummary.loadTimeTrend }}
            </span>
          </div>
          <p class="mt-2 text-xs text-muted">
            {{ t('dashboard.analytics.pending.externalAnalytics') }}
          </p>
          <UProgress
            :model-value="analytics.edgeSummary.progressValue"
            :max="100"
            size="sm"
            class="mt-4"
          />
        </UCard>

        <UCard variant="outline" :ui="dashboardCardUi" class="lg:col-span-2">
          <template #header>
            <h2 class="text-base font-semibold text-highlighted">
              {{ t('dashboard.analytics.sections.edgeHealth') }}
            </h2>
          </template>

          <DashboardStats :items="edgeStatItems" />
          <p class="mt-3 text-xs text-muted">
            {{ t('dashboard.analytics.pending.webVitals') }}
          </p>
          <UProgress
            :model-value="analytics.edgeSummary.progressValue"
            :max="100"
            size="sm"
            class="mt-4"
          />
        </UCard>
      </section>

      <UCard
        v-if="analytics.edgeSummary.cacheHitRatio === '—'"
        variant="outline"
        :ui="dashboardCardUi"
        class="border-dashed"
      >
        <div class="flex items-start gap-3">
          <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted/60">
            <UIcon name="i-lucide-cloud" class="size-5 text-muted" />
          </div>
          <div>
            <h3 class="text-sm font-semibold text-highlighted">
              {{ t('dashboard.analytics.sections.cloudflareIntegration') }}
            </h3>
            <p class="mt-1 text-sm text-muted">
              {{ t('dashboard.analytics.pending.cloudflare') }}
            </p>
          </div>
        </div>
      </UCard>
    </div>

    <section class="rounded-2xl border border-dashed border-default bg-muted/20 p-4">
      <div class="flex items-start gap-3">
        <UIcon name="i-lucide-info" class="mt-0.5 size-4 shrink-0 text-muted" />
        <div>
          <p class="text-sm font-medium text-highlighted">
            {{ analytics.dataSourceLabel }}
          </p>
          <p class="mt-1 text-sm text-muted">
            {{ analytics.dataSourceDescription }}
          </p>
        </div>
      </div>
    </section>
  </div>
</template>
