<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'

import { dashboardCardUi } from '~/utils/dashboard-ui'
import { withDashboardRefresh } from '~/utils/dashboard-refresh'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth'],
  requiredPermission: 'newsletter:manage'
})

const { t, locale } = useI18n()
const toast = useToast()

useMohetSeo({
  title: () => t('dashboard.newsletter.title'),
  description: () => t('dashboard.newsletter.description')
})

type SubscriberStatus =
  | 'PENDING'
  | 'SUBSCRIBED'
  | 'UNSUBSCRIBED'
  | 'BOUNCED'
  | 'COMPLAINED'

type SubscriberRow = {
  id: string
  email: string
  name: string | null | undefined
  status: SubscriberStatus
  source: string | null | undefined
  locale: string | null | undefined
  createdAt: number
}

const search = ref('')
const statusFilter = ref<SubscriberStatus | 'ALL'>('ALL')
const limit = ref(50)
const offset = ref(0)
const isRefreshing = ref(false)

useDashboardPageToolbar({
  isRefreshing,
  onRefresh: () => refreshSubscribers()
})

const statusItems = computed(() => [
  { label: t('dashboard.newsletter.allStatuses'), value: 'ALL' as const },
  { label: t('dashboard.newsletter.status.subscribed'), value: 'SUBSCRIBED' as const },
  { label: t('dashboard.newsletter.status.pending'), value: 'PENDING' as const },
  { label: t('dashboard.newsletter.status.unsubscribed'), value: 'UNSUBSCRIBED' as const },
  { label: t('dashboard.newsletter.status.bounced'), value: 'BOUNCED' as const },
  { label: t('dashboard.newsletter.status.complained'), value: 'COMPLAINED' as const }
])

const queryInput = computed(() => ({
  search: search.value.trim() || null,
  status: statusFilter.value === 'ALL' ? null : statusFilter.value,
  limit: limit.value,
  offset: offset.value
}))

const {
  data: subscribersData,
  pending: isLoading,
  error: loadError,
  refresh
} = await useAsyncData(
  'newsletter-subscribers',
  () => GqlNewsletterSubscribers({ input: queryInput.value }),
  {
    watch: [queryInput]
  }
)

const connection = computed(() => subscribersData.value?.newsletterSubscribers)
const subscribers = computed(() => (connection.value?.items ?? []) as SubscriberRow[])
const summary = computed(
  () =>
    connection.value?.summary ?? {
      total: 0,
      subscribed: 0,
      pending: 0,
      unsubscribed: 0
    }
)

const summaryCards = computed(() => [
  {
    key: 'total',
    label: t('dashboard.newsletter.summary.total'),
    value: summary.value.total,
    icon: 'i-lucide-users',
    helper: t('dashboard.newsletter.description')
  },
  {
    key: 'subscribed',
    label: t('dashboard.newsletter.summary.subscribed'),
    value: summary.value.subscribed,
    icon: 'i-lucide-mail-check',
    helper: t('dashboard.newsletter.status.subscribed')
  },
  {
    key: 'pending',
    label: t('dashboard.newsletter.summary.pending'),
    value: summary.value.pending,
    icon: 'i-lucide-mail-question',
    helper: t('dashboard.newsletter.status.pending')
  },
  {
    key: 'unsubscribed',
    label: t('dashboard.newsletter.summary.unsubscribed'),
    value: summary.value.unsubscribed,
    icon: 'i-lucide-mail-x',
    helper: t('dashboard.newsletter.status.unsubscribed')
  }
])

type BadgeColor = 'primary' | 'info' | 'success' | 'neutral' | 'warning' | 'error'

function getStatusColor(status: string): BadgeColor {
  return (
    (
      {
        PENDING: 'warning',
        SUBSCRIBED: 'success',
        UNSUBSCRIBED: 'neutral',
        BOUNCED: 'error',
        COMPLAINED: 'error'
      } satisfies Record<string, BadgeColor>
    )[status] || 'neutral'
  )
}

function getStatusLabel(status: string) {
  const key = status.toLowerCase() as
    | 'pending'
    | 'subscribed'
    | 'unsubscribed'
    | 'bounced'
    | 'complained'

  return t(`dashboard.newsletter.status.${key}`)
}

function formatDate(value?: number | null) {
  if (!value) return '—'

  return new Intl.DateTimeFormat(locale.value, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value))
}

function formatOptional(value?: string | null) {
  return value?.trim() || '—'
}

const columns = computed<TableColumn<SubscriberRow>[]>(() => [
  {
    accessorKey: 'email',
    header: t('dashboard.newsletter.table.email')
  },
  {
    accessorKey: 'name',
    header: t('dashboard.newsletter.table.name'),
    cell: ({ row }) => formatOptional(row.original.name)
  },
  {
    accessorKey: 'status',
    header: t('dashboard.newsletter.table.status'),
    cell: ({ row }) => {
      const UBadge = resolveComponent('UBadge')

      return h(
        UBadge,
        {
          color: getStatusColor(row.original.status),
          variant: 'soft'
        },
        () => getStatusLabel(row.original.status)
      )
    }
  },
  {
    accessorKey: 'source',
    header: t('dashboard.newsletter.table.source'),
    cell: ({ row }) => formatOptional(row.original.source)
  },
  {
    accessorKey: 'locale',
    header: t('dashboard.newsletter.table.locale'),
    cell: ({ row }) => formatOptional(row.original.locale)
  },
  {
    accessorKey: 'createdAt',
    header: t('dashboard.newsletter.table.subscribedAt'),
    cell: ({ row }) => formatDate(row.original.createdAt)
  }
])

async function refreshSubscribers() {
  try {
    await withDashboardRefresh(isRefreshing, () => refresh())
    toast.add({
      color: 'success',
      icon: 'i-lucide-refresh-cw',
      title: t('dashboard.newsletter.refresh')
    })
  } catch {
    toast.add({
      color: 'error',
      icon: 'i-lucide-circle-alert',
      title: t('dashboard.newsletter.loadFailed')
    })
  }
}

watch([search, statusFilter], () => {
  offset.value = 0
})
</script>

<template>
  <DashboardWorkspacePage
    :title="t('dashboard.newsletter.title')"
    :description="t('dashboard.newsletter.description')"
    grid-class="grid-cols-1"
  >
    <template #summary>
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardMetric v-for="metric in summaryCards" :key="metric.key" :metric="metric" />
      </div>
    </template>

    <UCard variant="outline" :ui="dashboardCardUi" class="divide-y divide-default overflow-hidden">
      <div class="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center">
        <UInput
          v-model="search"
          class="w-full max-w-sm"
          icon="i-lucide-search"
          :placeholder="t('dashboard.newsletter.searchPlaceholder')"
        />

        <USelectMenu
          v-model="statusFilter"
          class="w-full sm:w-56"
          value-key="value"
          :items="statusItems"
          :placeholder="t('dashboard.newsletter.statusFilter')"
        />
      </div>

      <UAlert
        v-if="loadError"
        color="error"
        variant="soft"
        icon="i-lucide-circle-alert"
        :title="t('dashboard.newsletter.loadFailed')"
        class="mx-4 my-3"
      />

      <UTable
        :data="subscribers"
        :columns="columns"
        :loading="isLoading"
        :empty="t('dashboard.newsletter.empty')"
        class="w-full"
      />
    </UCard>
  </DashboardWorkspacePage>
</template>
