<script setup lang="ts">
import type { DashboardSummaryCard } from '~/components/dashboard/Metric.vue'
import {
  dashboardCardUi,
  dashboardChartCardMinHeightClass,
  dashboardChartCardUi
} from '~/utils/dashboard-ui'
import type { AudienceMetricMode } from '~/utils/dashboard-charts'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

const { t, locale } = useI18n()
const toast = useToast()

const range = useDashboardRangePreference()
const isRefreshing = ref(false)

useDashboardPageToolbar({
  isRefreshing,
  onRefresh: () => refreshDashboard()
})

const { data: dashboardHome, pending: isLoading, error, refresh } = await useDashboardHome(range)

useMohetSeo({
  title: () => t('dashboard.home.title'),
  description: () => t('dashboard.home.description')
})

const summaryCards = computed<DashboardSummaryCard[]>(() => {
  const summary = dashboardHome.value.summary

  return [
    {
      key: 'inboxUnread',
      label: t('dashboard.home.summary.inboxUnread'),
      value: summary.inboxUnread,
      icon: 'i-lucide-mail',
      helper: t('dashboard.home.summary.inboxUnreadHelper'),
      to: '/dashboard/inbox'
    },
    {
      key: 'needsReply',
      label: t('dashboard.home.summary.needsReply'),
      value: summary.needsReply,
      icon: 'i-lucide-reply',
      helper: t('dashboard.home.summary.needsReplyHelper'),
      to: '/dashboard/inbox'
    },
    {
      key: 'visitors',
      label: t('dashboard.home.summary.visitors'),
      value: summary.visits,
      icon: 'i-lucide-users',
      helper: t('dashboard.home.summary.visitorsHelper'),
      to: '/dashboard/analytics'
    },
    {
      key: 'pageViews',
      label: t('dashboard.home.summary.pageViews'),
      value: summary.pageViews,
      icon: 'i-lucide-chart-line',
      helper: t('dashboard.home.summary.pageViewsHelper'),
      to: '/dashboard/analytics'
    }
  ]
})

const audienceMetric = ref<AudienceMetricMode>('both')

const audienceMetricItems = computed(() => [
  { label: t('dashboard.analytics.chartMetrics.visitors'), value: 'visitors' as const },
  { label: t('dashboard.analytics.chartMetrics.pageViews'), value: 'pageViews' as const },
  { label: t('dashboard.analytics.chartMetrics.both'), value: 'both' as const }
])

const audienceTrendIsEmpty = computed(() =>
  dashboardHome.value.audienceTrend.every((point) => point.visitors === 0 && point.pageViews === 0)
)

const totalVisitors = computed(() =>
  dashboardHome.value.audienceTrend.reduce((sum, point) => sum + point.visitors, 0)
)

const hasDashboardHomeData = computed(() => {
  const summary = dashboardHome.value.summary

  return (
    summary.inboxUnread > 0 ||
    summary.needsReply > 0 ||
    summary.leads > 0 ||
    summary.visits > 0 ||
    summary.pageViews > 0 ||
    dashboardHome.value.audienceTrend.length > 0 ||
    dashboardHome.value.inboxPreview.length > 0 ||
    dashboardHome.value.readerSignals.length > 0 ||
    dashboardHome.value.systemHealth.length > 0 ||
    dashboardHome.value.recentActivity.length > 0 ||
    dashboardHome.value.quickLinks.length > 0
  )
})
const isInitialDashboardLoading = computed(() => isLoading.value && !hasDashboardHomeData.value)

const activityIconByType: Record<string, string> = {
  inbox: 'i-lucide-mail',
  notification: 'i-lucide-bell',
  new_inbound_email: 'i-lucide-mail',
  new_contact_message: 'i-lucide-inbox'
}

const activityIconClass: Record<string, string> = {
  inbox: 'text-primary',
  notification: 'text-muted',
  new_inbound_email: 'text-primary',
  new_contact_message: 'text-primary'
}

const timeFormatter = computed(
  () =>
    new Intl.DateTimeFormat(locale.value === 'fa' ? 'fa-IR' : 'en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    })
)

function formatActivityTime(timestamp: number) {
  return timeFormatter.value.format(new Date(timestamp))
}

async function refreshDashboard() {
  try {
    await withDashboardRefresh(isRefreshing, () => refresh())

    toast.add({
      color: 'success',
      icon: 'i-lucide-refresh-cw',
      title: t('dashboard.home.refreshSuccess')
    })
  } catch (currentError) {
    toast.add({
      color: 'error',
      icon: 'i-lucide-circle-alert',
      title:
        currentError instanceof Error ? currentError.message : t('dashboard.home.refreshFailed')
    })
  }
}

watch(error, (currentError) => {
  if (!currentError || import.meta.server) return

  toast.add({
    color: 'error',
    icon: 'i-lucide-circle-alert',
    title: currentError instanceof Error ? currentError.message : t('dashboard.home.refreshFailed')
  })
})
</script>

<template>
  <div class="mx-auto w-full max-w-[1600px] space-y-6">
    <section class="flex min-w-0 items-start gap-3">
      <UDashboardSidebarCollapse class="shrink-0 lg:hidden" />

      <div class="min-w-0">
        <h1 class="text-3xl font-semibold tracking-tight text-highlighted">
          {{ t('dashboard.home.title') }}
        </h1>
        <p class="mt-1 text-sm text-muted">
          {{ t('dashboard.home.description') }}
        </p>
      </div>
    </section>

    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <template v-if="isInitialDashboardLoading">
        <UCard v-for="index in 4" :key="index" variant="outline" :ui="dashboardCardUi">
          <USkeleton class="h-[6.75rem] w-full" />
        </UCard>
      </template>
      <DashboardMetric
        v-for="metric in summaryCards"
        v-else
        :key="metric.key"
        :metric="metric"
      />
    </section>

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
                {{ t('dashboard.overview.audience') }}
              </h2>
              <div class="mt-3 flex items-center gap-2">
                <p class="text-2xl font-semibold text-highlighted">
                  {{ totalVisitors }}
                </p>
              </div>
              <p class="mt-1 text-sm text-muted">
                {{ t('dashboard.overview.audienceHelper') }}
              </p>
              <p v-if="audienceTrendIsEmpty" class="mt-2 text-xs text-muted">
                {{ t('dashboard.home.audience.pending') }}
              </p>
            </div>

            <UFieldGroup size="xs" class="flex-wrap justify-end">
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
          </div>
        </template>

        <DashboardAreaChart
          :points="dashboardHome.audienceTrend"
          :metric="audienceMetric"
          :loading="isInitialDashboardLoading"
          :aria-label="t('dashboard.overview.audienceChartLabel')"
        >
          <template #empty>
            {{ t('dashboard.home.audience.pending') }}
          </template>
        </DashboardAreaChart>
      </UCard>

      <DashboardInboxPreview
        class="xl:col-span-2"
        :items="dashboardHome.inboxPreview"
        :loading="isInitialDashboardLoading"
      />
    </section>

    <section class="grid items-stretch gap-4 lg:grid-cols-2 xl:grid-cols-3">
      <DashboardPulse
        :content-pulse="dashboardHome.contentPulse"
        :loading="isInitialDashboardLoading"
      />
      <DashboardSignals
        :signals="dashboardHome.readerSignals"
        :loading="isInitialDashboardLoading"
      />
      <DashboardHealth
        :items="dashboardHome.systemHealth"
        :loading="isInitialDashboardLoading"
      />
    </section>

    <section class="grid gap-4 lg:grid-cols-3">
      <UCard variant="outline" :ui="dashboardCardUi" class="lg:col-span-2">
        <template #header>
          <h2 class="text-base font-semibold text-highlighted">
            {{ t('dashboard.overview.recentActivity') }}
          </h2>
        </template>

        <div v-if="isInitialDashboardLoading" class="grid gap-4 md:grid-cols-2">
          <USkeleton v-for="index in 4" :key="index" class="h-14 w-full" />
        </div>

        <p v-else-if="!dashboardHome.recentActivity.length" class="text-sm text-muted">
          {{ t('dashboard.home.recentActivity.empty') }}
        </p>

        <div v-else class="grid gap-4 md:grid-cols-2">
          <NuxtLink
            v-for="activity in dashboardHome.recentActivity"
            :key="activity.id"
            :to="activity.href || '/dashboard'"
            class="flex items-start gap-3 rounded-lg transition-colors hover:bg-muted/30"
          >
            <div class="flex size-9 items-center justify-center rounded-full bg-muted/60">
              <UIcon
                :name="activityIconByType[activity.type] || 'i-lucide-activity'"
                class="size-5"
                :class="activityIconClass[activity.type] || 'text-muted'"
              />
            </div>

            <div class="min-w-0">
              <p class="text-sm font-medium text-highlighted">
                {{ activity.title }}
              </p>
              <p class="mt-0.5 line-clamp-2 text-xs text-muted">
                {{ activity.description }}
              </p>
              <p class="mt-1 text-xs text-muted">
                {{ formatActivityTime(activity.createdAt) }}
              </p>
            </div>
          </NuxtLink>
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
          <h2 class="text-base font-semibold text-highlighted">
            {{ t('dashboard.home.quickLinks.title') }}
          </h2>
        </template>

        <div v-if="isInitialDashboardLoading" class="space-y-3">
          <USkeleton v-for="index in 4" :key="index" class="h-10 w-full" />
        </div>

        <ul v-else class="space-y-2">
          <li v-for="link in dashboardHome.quickLinks" :key="link.key">
            <UButton
              :to="link.to"
              :icon="link.icon"
              color="neutral"
              variant="ghost"
              class="w-full justify-start"
            >
              <span class="min-w-0 text-start">
                <span class="block text-sm font-medium">{{ link.label }}</span>
                <span class="block text-xs text-muted">{{ link.description }}</span>
              </span>
            </UButton>
          </li>
        </ul>
      </UCard>
    </section>
  </div>
</template>
