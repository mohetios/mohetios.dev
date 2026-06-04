<script setup lang="ts">
import type { DashboardSummaryCard } from '~/components/dashboard/DashboardMetricCard.vue'
import { dashboardCardUi } from '~/utils/dashboard-ui'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

const { t, locale } = useI18n()
const toast = useToast()

const {
  data: dashboardHome,
  pending: isLoading,
  error,
  refresh
} = await useDashboardHome()

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
      key: 'leads',
      label: t('dashboard.home.summary.leads'),
      value: summary.leads,
      icon: 'i-lucide-user-plus',
      helper: t('dashboard.home.summary.leadsHelper'),
      to: '/dashboard/leads'
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

const audienceChartData = computed(() =>
  dashboardHome.value.audienceTrend.map((point) => ({
    label: point.date.slice(5),
    value: point.visitors
  }))
)

const safeAudienceData = computed(() =>
  audienceChartData.value.length ? audienceChartData.value : [{ label: '', value: 0 }]
)

const audienceTrendIsEmpty = computed(() =>
  dashboardHome.value.audienceTrend.every((point) => point.visitors === 0 && point.pageViews === 0)
)

const totalVisitors = computed(() =>
  dashboardHome.value.audienceTrend.reduce((sum, point) => sum + point.visitors, 0)
)

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

const activityIconByType: Record<string, string> = {
  inbox: 'i-lucide-mail',
  notification: 'i-lucide-bell',
  'new_inbound_email': 'i-lucide-mail',
  'new_contact_message': 'i-lucide-inbox'
}

const activityIconClass: Record<string, string> = {
  inbox: 'text-primary',
  notification: 'text-muted',
  'new_inbound_email': 'text-primary',
  'new_contact_message': 'text-primary'
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

const isRefreshing = ref(false)

async function refreshDashboard() {
  isRefreshing.value = true

  try {
    await refresh()

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
        currentError instanceof Error
          ? currentError.message
          : t('dashboard.home.refreshFailed')
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
      currentError instanceof Error ? currentError.message : t('dashboard.home.refreshFailed')
  })
})
</script>

<template>
  <div class="mx-auto w-full max-w-[1600px] space-y-6">
    <section class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="text-3xl font-semibold tracking-tight text-highlighted">
          {{ t('dashboard.home.title') }}
        </h1>
        <p class="mt-1 text-sm text-muted">
          {{ t('dashboard.home.description') }}
        </p>
      </div>

      <div class="flex items-center gap-2">
        <UButton
          color="neutral"
          variant="outline"
          icon="i-lucide-refresh-cw"
          :loading="isRefreshing || isLoading"
          @click="refreshDashboard"
        >
          {{ t('dashboard.home.refresh') }}
        </UButton>
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
      <template v-if="isLoading">
        <UCard v-for="index in 4" :key="index" variant="outline" :ui="dashboardCardUi">
          <USkeleton class="h-20 w-full" />
        </UCard>
      </template>
      <DashboardMetricCard
        v-for="metric in summaryCards"
        v-else
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
                  {{ totalVisitors }}
                </p>
              </div>
              <p class="mt-1 text-sm text-muted">
                {{ t('dashboard.overview.audienceHelper') }}
              </p>
              <p
                v-if="audienceTrendIsEmpty"
                class="mt-2 text-xs text-muted"
              >
                {{ t('dashboard.home.audience.pending') }}
              </p>
            </div>

            <UButton
              color="neutral"
              variant="outline"
              trailing-icon="i-lucide-chevron-down"
              class="shrink-0"
              to="/dashboard/analytics"
            >
              {{ t('dashboard.overview.visitors') }}
            </UButton>
          </div>
        </template>

        <div v-if="isLoading" class="h-64 min-h-48">
          <USkeleton class="h-full w-full" />
        </div>

        <div v-else class="h-64 min-h-48">
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
              class="fill-current text-primary/10"
            />

            <polyline
              :points="audiencePolyline"
              fill="none"
              class="stroke-current text-primary"
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

      <DashboardInboxPreviewCard
        class="xl:col-span-2"
        :items="dashboardHome.inboxPreview"
        :loading="isLoading"
      />
    </section>

    <section class="grid items-stretch gap-4 lg:grid-cols-2 xl:grid-cols-3">
      <DashboardContentPulseCard
        :content-pulse="dashboardHome.contentPulse"
        :loading="isLoading"
      />
      <DashboardReaderSignalsCard
        :signals="dashboardHome.readerSignals"
        :loading="isLoading"
      />
      <DashboardSystemHealthCard
        :items="dashboardHome.systemHealth"
        :loading="isLoading"
      />
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

        <div v-if="isLoading" class="grid gap-4 md:grid-cols-2">
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

        <div v-if="isLoading" class="space-y-3">
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
