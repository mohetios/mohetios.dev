<script setup lang="ts">
import { dashboardCardUi } from '~/utils/dashboard-ui'
import type { AnalyticsRange } from '~/composables/useAnalyticsDashboard'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth'],
  requiredPermission: 'dashboard:view'
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
const isRefreshing = ref(false)

const {
  data: analytics,
  pending: isLoading,
  error,
  refresh
} = await useAnalyticsDashboard(range)

const tabItems = computed(() => [
  { label: t('dashboard.analytics.tabs.overview'), value: 'overview', icon: 'i-lucide-layout-dashboard' },
  { label: t('dashboard.analytics.tabs.content'), value: 'content', icon: 'i-lucide-file-text' },
  { label: t('dashboard.analytics.tabs.search'), value: 'search', icon: 'i-lucide-search' },
  { label: t('dashboard.analytics.tabs.referrers'), value: 'referrers', icon: 'i-lucide-share-2' },
  { label: t('dashboard.analytics.tabs.performance'), value: 'performance', icon: 'i-lucide-gauge' }
])

const rangeItems = computed(() => [
  { label: t('dashboard.analytics.ranges.last7Days'), value: 'LAST_7_DAYS' },
  { label: t('dashboard.analytics.ranges.last30Days'), value: 'LAST_30_DAYS' },
  { label: t('dashboard.analytics.ranges.last90Days'), value: 'LAST_90_DAYS' }
])

type BadgeColor = 'primary' | 'info' | 'success' | 'neutral' | 'warning' | 'error'

function getSourceColor(source: string): BadgeColor {
  return (
    {
      Direct: 'neutral',
      Search: 'primary',
      Social: 'info',
      Referral: 'success',
      Newsletter: 'warning'
    } satisfies Record<string, BadgeColor>
  )[source] || 'neutral'
}

function getVitalColor(status: string): BadgeColor {
  return (
    {
      Good: 'success',
      'Needs improvement': 'warning',
      Poor: 'error',
      Pending: 'neutral'
    } satisfies Record<string, BadgeColor>
  )[status] || 'neutral'
}

function formatNumber(value: number) {
  return new Intl.NumberFormat().format(value)
}

const safeTrend = computed(() =>
  analytics.value.trend.length
    ? analytics.value.trend
    : [{ date: '', visitors: 0, pageViews: 0, searchClicks: 0 }]
)

const maxVisitors = computed(() => {
  const max = Math.max(...safeTrend.value.map((point) => point.visitors))
  return max > 0 ? max : 1
})

function getPointStyle(value: number, index: number) {
  const total = safeTrend.value.length
  const x = total <= 1 ? 0 : (index / (total - 1)) * 100
  const y = 100 - (value / maxVisitors.value) * 80

  return `${x},${y}`
}

const trendPolyline = computed(() =>
  safeTrend.value.map((point, index) => getPointStyle(point.visitors, index)).join(' ')
)

const trendAreaPoints = computed(() => {
  const points = safeTrend.value
    .map((point, index) => getPointStyle(point.visitors, index))
    .join(' ')

  return `0,100 ${points} 100,100`
})

const totalPageViews = computed(() =>
  analytics.value.trend.reduce((total, point) => total + point.pageViews, 0)
)

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
  isRefreshing.value = true

  try {
    await refresh()

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
  } finally {
    isRefreshing.value = false
  }
}

watch(error, (currentError) => {
  if (!currentError || import.meta.server) return

  toast.add({
    color: 'error',
    icon: 'i-lucide-circle-alert',
    title:
      currentError instanceof Error
        ? currentError.message
        : t('dashboard.analytics.refreshFailed')
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

      <div class="flex items-center gap-2">
        <USelect
          v-model="range"
          :items="rangeItems"
          value-key="value"
          label-key="label"
          icon="i-lucide-calendar"
          class="w-full sm:w-44"
        />

        <UButton
          color="neutral"
          variant="ghost"
          icon="i-lucide-refresh-cw"
          :loading="isRefreshing"
          @click="refreshAnalytics"
        >
          {{ t('dashboard.analytics.refresh') }}
        </UButton>

        <UButton color="neutral" variant="outline" icon="i-lucide-download" disabled>
          {{ t('dashboard.analytics.export') }}
        </UButton>
      </div>
    </section>

    <section v-if="isLoading" class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <USkeleton v-for="item in 4" :key="item" class="h-28 w-full rounded-2xl" />
    </section>

    <section v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <DashboardMetricCard
        v-for="metric in analytics.metrics"
        :key="metric.key"
        :metric="metric"
      />
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
      <section class="grid gap-4 xl:grid-cols-5">
        <UCard variant="outline" :ui="dashboardCardUi" class="flex flex-col xl:col-span-3">
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
              <div class="text-right">
                <p class="text-2xl font-semibold text-highlighted">
                  {{ formatNumber(totalPageViews) }}
                </p>
                <p class="text-xs text-muted">
                  {{ t('dashboard.analytics.sections.pageViews') }}
                </p>
              </div>
            </div>
          </template>

          <div class="h-64 min-h-48">
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              class="h-full w-full"
              role="img"
              :aria-label="t('dashboard.analytics.sections.audienceTrendDescription')"
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
                :points="trendAreaPoints"
                class="fill-current text-primary/10"
              />

              <polyline
                :points="trendPolyline"
                fill="none"
                class="stroke-current text-primary"
                stroke-width="1.3"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>

          <div
            class="mt-3 grid gap-1 text-xs text-muted"
            :style="{ gridTemplateColumns: `repeat(${safeTrend.length}, minmax(0, 1fr))` }"
          >
            <span v-for="point in safeTrend" :key="point.date" class="truncate">
              {{ point.date }}
            </span>
          </div>
        </UCard>

        <UCard variant="outline" :ui="dashboardCardUi" class="xl:col-span-2">
          <template #header>
            <h2 class="text-base font-semibold text-highlighted">
              {{ t('dashboard.analytics.sections.topPages') }}
            </h2>
          </template>

          <div
            v-if="!analytics.topPages.length"
            class="py-10 text-center text-sm text-muted"
          >
            {{ t('dashboard.analytics.empty.topPages') }}
          </div>

          <ul v-else class="divide-y divide-default">
            <li
              v-for="page in analytics.topPages.slice(0, 5)"
              :key="page.path"
              class="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div class="min-w-0">
                <p class="truncate text-sm font-medium text-highlighted">
                  {{ page.title }}
                </p>
                <p class="truncate text-xs text-muted">
                  {{ page.path }}
                </p>
              </div>

              <div class="flex shrink-0 flex-col items-end gap-1">
                <span class="text-sm font-medium text-highlighted">
                  {{ formatNumber(page.views) }}
                </span>
                <UBadge :color="getSourceColor(page.source)" variant="soft" size="xs" class="rounded-full">
                  {{ page.source }}
                </UBadge>
              </div>
            </li>
          </ul>
        </UCard>
      </section>

      <section class="grid gap-4 lg:grid-cols-3">
        <UCard variant="outline" :ui="dashboardCardUi">
          <template #header>
            <h2 class="text-base font-semibold text-highlighted">
              {{ t('dashboard.analytics.sections.referrers') }}
            </h2>
          </template>

          <div
            v-if="!analytics.referrers.length"
            class="py-10 text-center text-sm text-muted"
          >
            {{ t('dashboard.analytics.empty.referrers') }}
          </div>

          <ul v-else class="space-y-4">
            <li v-for="item in analytics.referrers" :key="item.source">
              <div class="flex items-center justify-between text-sm">
                <span class="font-medium text-highlighted">{{ item.source }}</span>
                <span class="text-muted">{{ formatNumber(item.visits) }} · {{ item.share }}%</span>
              </div>
              <UProgress :model-value="item.share" :max="100" size="sm" class="mt-2" />
            </li>
          </ul>
        </UCard>

        <UCard variant="outline" :ui="dashboardCardUi">
          <template #header>
            <h2 class="text-base font-semibold text-highlighted">
              {{ t('dashboard.analytics.sections.countries') }}
            </h2>
          </template>

          <div
            v-if="!analytics.countries.length"
            class="py-10 text-center text-sm text-muted"
          >
            {{ t('dashboard.analytics.empty.countries') }}
          </div>

          <ul v-else class="space-y-4">
            <li v-for="item in analytics.countries" :key="item.code">
              <div class="flex items-center justify-between text-sm">
                <span class="flex items-center gap-2 font-medium text-highlighted">
                  <span class="rounded bg-muted/60 px-1.5 py-0.5 text-xs font-medium text-muted">
                    {{ item.code }}
                  </span>
                  {{ item.country }}
                </span>
                <span class="text-muted">{{ formatNumber(item.visits) }} · {{ item.share }}%</span>
              </div>
              <UProgress :model-value="item.share" :max="100" size="sm" class="mt-2" />
            </li>
          </ul>
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
                <UBadge :color="getVitalColor(vital.status)" variant="soft" size="xs" class="rounded-full">
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
      <section class="flex flex-col gap-3 rounded-2xl border border-default bg-default p-3 sm:flex-row sm:items-center sm:justify-between">
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
              <tr class="border-b border-default text-left text-xs uppercase tracking-wide text-muted">
                <th class="px-4 py-3 font-medium">{{ t('dashboard.analytics.table.page') }}</th>
                <th class="px-4 py-3 font-medium">{{ t('dashboard.analytics.table.views') }}</th>
                <th class="px-4 py-3 font-medium">{{ t('dashboard.analytics.table.visitors') }}</th>
                <th class="px-4 py-3 font-medium">{{ t('dashboard.analytics.table.avgTime') }}</th>
                <th class="px-4 py-3 font-medium">{{ t('dashboard.analytics.table.topSource') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-default">
              <tr v-for="page in filteredPages" :key="page.path" class="transition hover:bg-muted/30">
                <td class="px-4 py-3">
                  <p class="font-medium text-highlighted">{{ page.title }}</p>
                  <p class="text-xs text-muted">{{ page.path }}</p>
                </td>
                <td class="px-4 py-3 text-highlighted">{{ formatNumber(page.views) }}</td>
                <td class="px-4 py-3 text-muted">{{ formatNumber(page.visitors) }}</td>
                <td class="px-4 py-3 text-muted">{{ page.avgTime }}</td>
                <td class="px-4 py-3">
                  <UBadge :color="getSourceColor(page.source)" variant="soft" size="xs" class="rounded-full">
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
      <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <UCard
          v-for="kpi in searchKpis"
          :key="kpi.key"
          variant="outline"
          :ui="dashboardCardUi"
        >
          <div class="flex items-center gap-3">
            <div class="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
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
              <tr class="border-b border-default text-left text-xs uppercase tracking-wide text-muted">
                <th class="px-4 py-3 font-medium">{{ t('dashboard.analytics.table.query') }}</th>
                <th class="px-4 py-3 font-medium">{{ t('dashboard.analytics.search.clicks') }}</th>
                <th class="px-4 py-3 font-medium">{{ t('dashboard.analytics.search.impressions') }}</th>
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

          <div
            v-if="!analytics.referrers.length"
            class="py-10 text-center text-sm text-muted"
          >
            {{ t('dashboard.analytics.empty.referrers') }}
          </div>

          <ul v-else class="space-y-4">
            <li v-for="item in analytics.referrers" :key="item.source">
              <div class="flex items-center justify-between text-sm">
                <span class="font-medium text-highlighted">{{ item.source }}</span>
                <span class="flex items-center gap-2 text-muted">
                  {{ formatNumber(item.visits) }} · {{ item.share }}%
                  <UBadge
                    v-if="item.trend"
                    color="success"
                    variant="soft"
                    size="xs"
                    class="rounded-full"
                  >
                    {{ item.trend }}
                  </UBadge>
                </span>
              </div>
              <UProgress :model-value="item.share" :max="100" size="sm" class="mt-2" />
            </li>
          </ul>
        </UCard>

        <UCard variant="outline" :ui="dashboardCardUi">
          <template #header>
            <h2 class="text-base font-semibold text-highlighted">
              {{ t('dashboard.analytics.sections.topCountries') }}
            </h2>
          </template>

          <div
            v-if="!analytics.countries.length"
            class="py-10 text-center text-sm text-muted"
          >
            {{ t('dashboard.analytics.empty.countries') }}
          </div>

          <ul v-else class="space-y-4">
            <li v-for="item in analytics.countries" :key="item.code">
              <div class="flex items-center justify-between text-sm">
                <span class="flex items-center gap-2 font-medium text-highlighted">
                  <span class="rounded bg-muted/60 px-1.5 py-0.5 text-xs font-medium text-muted">
                    {{ item.code }}
                  </span>
                  {{ item.country }}
                </span>
                <span class="text-muted">{{ formatNumber(item.visits) }} · {{ item.share }}%</span>
              </div>
              <UProgress :model-value="item.share" :max="100" size="sm" class="mt-2" />
            </li>
          </ul>
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
            <UBadge :color="getVitalColor(vital.status)" variant="soft" size="sm" class="rounded-full">
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
              {{ t('dashboard.analytics.sections.edgeSummary') }}
            </h2>
          </template>

          <div class="grid gap-3 sm:grid-cols-3">
            <div class="rounded-xl border border-default bg-muted/20 p-3">
              <div class="flex items-center gap-1.5 text-xs text-muted">
                <UIcon name="i-lucide-database" class="size-3.5" />
                Cache hit ratio
              </div>
              <p class="mt-1 text-lg font-semibold text-highlighted">
                {{ analytics.edgeSummary.cacheHitRatio }}
              </p>
            </div>
            <div class="rounded-xl border border-default bg-muted/20 p-3">
              <div class="flex items-center gap-1.5 text-xs text-muted">
                <UIcon name="i-lucide-globe" class="size-3.5" />
                Edge requests
              </div>
              <p class="mt-1 text-lg font-semibold text-highlighted">
                {{ analytics.edgeSummary.edgeRequests }}
              </p>
            </div>
            <div class="rounded-xl border border-default bg-muted/20 p-3">
              <div class="flex items-center gap-1.5 text-xs text-muted">
                <UIcon name="i-lucide-triangle-alert" class="size-3.5" />
                Edge errors
              </div>
              <p class="mt-1 text-lg font-semibold text-highlighted">
                {{ analytics.edgeSummary.edgeErrors }}
              </p>
            </div>
          </div>
          <p class="mt-3 text-xs text-muted">
            {{ t('dashboard.analytics.pending.cloudflare') }}
          </p>
        </UCard>
      </section>

      <UCard variant="outline" :ui="dashboardCardUi" class="border-dashed">
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
