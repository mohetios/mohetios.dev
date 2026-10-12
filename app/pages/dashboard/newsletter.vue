<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'

import { dashboardCardUi } from '~/utils/dashboard-ui'
import { withDashboardRefresh } from '~/utils/dashboard-refresh'
import {
  NEWSLETTER_TEMPLATES,
  toNewsletterLocale,
  type NewsletterTemplate
} from '~~/shared/utils/newsletter-email'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth'],
  requiredPermission: 'newsletter:manage'
})

const { t, locale } = useI18n()
const toast = useToast()
const route = useRoute()

useMohetiosSeo({
  title: () => t('dashboard.newsletter.title'),
  description: () => t('dashboard.newsletter.description'),
  noindex: true
})

type SubscriberStatus = 'PENDING' | 'SUBSCRIBED' | 'UNSUBSCRIBED' | 'BOUNCED' | 'COMPLAINED'

type SubscriberRow = {
  id: string
  email: string
  name?: string | null
  status: SubscriberStatus
  source?: string | null
  locale?: string | null
  createdAt: number
}

const PAGE_SIZE = 50

// URL state: ?tab=subscribers, ?issue=<id>|new&template=WEEKLY&lang=fa
const activeTab = computed(() => (route.query.tab === 'subscribers' ? 'subscribers' : 'issues'))
const issueId = computed(() => (typeof route.query.issue === 'string' ? route.query.issue : null))
const newTemplate = computed<NewsletterTemplate>(
  () => NEWSLETTER_TEMPLATES.find((template) => template === route.query.template) ?? 'WEEKLY'
)
const newLocale = computed(() => toNewsletterLocale(String(route.query.lang ?? '')))

function setQuery(query: Record<string, string | undefined>) {
  return navigateTo({ path: route.path, query })
}

const tabItems = computed(() => [
  { label: t('dashboard.newsletter.tabs.issues'), value: 'issues', icon: 'i-lucide-mail' },
  {
    label: t('dashboard.newsletter.tabs.subscribers'),
    value: 'subscribers',
    icon: 'i-lucide-users'
  }
])

// Issues
const {
  data: issuesData,
  pending: issuesLoading,
  error: issuesError,
  refresh: refreshIssues
} = await useAsyncData('newsletter-issues', () => GqlNewsletterIssues())

const issues = computed(() => issuesData.value?.newsletterIssues.items ?? [])
const audience = computed(() => issuesData.value?.newsletterIssues.audience ?? [])

const nextScheduledAt = computed(() =>
  issues.value
    .filter((issue) => issue.status === 'SCHEDULED' && issue.scheduledAt)
    .reduce<number | null>(
      (next, issue) => (next === null || issue.scheduledAt! < next ? issue.scheduledAt! : next),
      null
    )
)

// Subscribers
const search = ref('')
const statusFilter = ref<SubscriberStatus | 'ALL'>('ALL')
const page = ref(1)

const statusItems = computed(() => [
  { label: t('dashboard.newsletter.allStatuses'), value: 'ALL' as const },
  ...(['SUBSCRIBED', 'PENDING', 'UNSUBSCRIBED', 'BOUNCED', 'COMPLAINED'] as const).map((value) => ({
    label: getStatusLabel(value),
    value
  }))
])

const queryInput = computed(() => ({
  search: search.value.trim() || null,
  status: statusFilter.value === 'ALL' ? null : statusFilter.value,
  limit: PAGE_SIZE,
  offset: (page.value - 1) * PAGE_SIZE
}))

const {
  data: subscribersData,
  pending: subscribersLoading,
  error: subscribersError,
  refresh: refreshSubscribers
} = await useAsyncData(
  'newsletter-subscribers',
  () => GqlNewsletterSubscribers({ input: queryInput.value }),
  { watch: [queryInput] }
)

const connection = computed(() => subscribersData.value?.newsletterSubscribers)
const subscribers = computed(() => (connection.value?.items ?? []) as SubscriberRow[])
const summary = computed(
  () => connection.value?.summary ?? { total: 0, subscribed: 0, pending: 0, unsubscribed: 0 }
)

watch([search, statusFilter], () => {
  page.value = 1
})

const isRefreshing = ref(false)

useDashboardPageToolbar({
  isRefreshing,
  onRefresh: refreshAll
})

async function refreshAll() {
  try {
    await withDashboardRefresh(isRefreshing, () =>
      Promise.all([refreshIssues(), refreshSubscribers()])
    )
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

function n(value: number) {
  return formatLocalizedNumber(value, locale.value)
}

function formatDate(value?: number | null) {
  if (!value) return '—'

  return new Intl.DateTimeFormat(locale.value, { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value)
  )
}

const summaryCards = computed(() => [
  {
    key: 'subscribed',
    label: t('dashboard.newsletter.summary.subscribed'),
    value: n(summary.value.subscribed),
    icon: 'i-lucide-mail-check',
    helper: t('dashboard.newsletter.summary.total') + ': ' + n(summary.value.total)
  },
  {
    key: 'unsubscribed',
    label: t('dashboard.newsletter.summary.unsubscribed'),
    value: n(summary.value.unsubscribed),
    icon: 'i-lucide-mail-x',
    helper: t('dashboard.newsletter.summary.pending') + ': ' + n(summary.value.pending)
  },
  {
    key: 'sent',
    label: t('dashboard.newsletter.summaryExtra.issuesSent'),
    value: n(issues.value.filter((issue) => issue.status === 'SENT').length),
    icon: 'i-lucide-send',
    helper: t('dashboard.newsletter.summaryExtra.issuesSentHelper')
  },
  {
    key: 'next',
    label: t('dashboard.newsletter.summaryExtra.nextIssue'),
    value: nextScheduledAt.value
      ? formatDate(nextScheduledAt.value)
      : t('dashboard.newsletter.summaryExtra.nothingScheduled'),
    icon: 'i-lucide-calendar-clock',
    helper: t('dashboard.newsletter.tabs.issues')
  }
])

type BadgeColor = 'success' | 'neutral' | 'warning' | 'error'

const statusColors: Record<SubscriberStatus, BadgeColor> = {
  PENDING: 'warning',
  SUBSCRIBED: 'success',
  UNSUBSCRIBED: 'neutral',
  BOUNCED: 'error',
  COMPLAINED: 'error'
}

function getStatusLabel(status: SubscriberStatus) {
  return t(`dashboard.newsletter.status.${status.toLowerCase()}`)
}

const columns = computed<TableColumn<SubscriberRow>[]>(() => {
  const UBadge = resolveComponent('UBadge')

  return [
    { accessorKey: 'email', header: t('dashboard.newsletter.table.email') },
    {
      accessorKey: 'name',
      header: t('dashboard.newsletter.table.name'),
      cell: ({ row }) => row.original.name?.trim() || '—'
    },
    {
      accessorKey: 'status',
      header: t('dashboard.newsletter.table.status'),
      cell: ({ row }) =>
        h(UBadge, { color: statusColors[row.original.status], variant: 'soft' }, () =>
          getStatusLabel(row.original.status)
        )
    },
    {
      accessorKey: 'source',
      header: t('dashboard.newsletter.table.source'),
      cell: ({ row }) => row.original.source?.trim() || '—'
    },
    {
      accessorKey: 'locale',
      header: t('dashboard.newsletter.table.locale'),
      cell: ({ row }) => row.original.locale?.trim() || '—'
    },
    {
      accessorKey: 'createdAt',
      header: t('dashboard.newsletter.table.subscribedAt'),
      cell: ({ row }) => formatDate(row.original.createdAt)
    }
  ]
})

const pageRange = computed(() => {
  const total = connection.value?.total ?? 0
  const from = total ? (page.value - 1) * PAGE_SIZE + 1 : 0

  return t('dashboard.newsletter.pagination', {
    from: n(from),
    to: n(Math.min(page.value * PAGE_SIZE, total)),
    total: n(total)
  })
})

function openIssue(id: string) {
  setQuery({ issue: id })
}

function createIssue(template: NewsletterTemplate, lang: string) {
  setQuery({ issue: 'new', template, lang })
}

function closeComposer() {
  setQuery({})
  refreshIssues()
}

function onIssueSaved(id: string) {
  if (issueId.value !== id) {
    navigateTo({ path: route.path, query: { issue: id } }, { replace: true })
  }
}
</script>

<template>
  <DashboardWorkspacePage
    :title="t('dashboard.newsletter.title')"
    :description="t('dashboard.newsletter.description')"
    grid-class="grid-cols-1"
  >
    <template v-if="!issueId" #summary>
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardMetric v-for="metric in summaryCards" :key="metric.key" :metric="metric" />
      </div>
    </template>

    <template v-if="!issueId" #filters>
      <UTabs
        :model-value="activeTab"
        :items="tabItems"
        :content="false"
        variant="link"
        class="w-full"
        @update:model-value="
          (tab) => setQuery({ tab: tab === 'subscribers' ? 'subscribers' : undefined })
        "
      />
    </template>

    <DashboardNewsletterComposer
      v-if="issueId"
      :issue-id="issueId"
      :template="newTemplate"
      :locale="newLocale"
      :audience="audience"
      @close="closeComposer"
      @saved="onIssueSaved"
    />

    <template v-else-if="activeTab === 'issues'">
      <UAlert
        v-if="issuesError"
        color="error"
        variant="soft"
        icon="i-lucide-circle-alert"
        :title="t('dashboard.newsletter.issues.loadFailed')"
      />
      <DashboardNewsletterIssues
        :issues="issues"
        :loading="issuesLoading"
        @open="openIssue"
        @create="createIssue"
      />
    </template>

    <UCard
      v-else
      variant="outline"
      :ui="{ ...dashboardCardUi, body: 'p-0' }"
      class="flex min-h-0 flex-col divide-y divide-default overflow-hidden"
    >
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
        v-if="subscribersError"
        color="error"
        variant="soft"
        icon="i-lucide-circle-alert"
        :title="t('dashboard.newsletter.loadFailed')"
        class="mx-4 my-3"
      />

      <UTable
        :data="subscribers"
        :columns="columns"
        :loading="subscribersLoading"
        :empty="t('dashboard.newsletter.empty')"
        class="min-h-0 w-full flex-1"
      />

      <div class="flex items-center justify-between gap-3 px-4 py-3 text-sm text-muted">
        <span>{{ pageRange }}</span>
        <UPagination
          v-model:page="page"
          :total="connection?.total ?? 0"
          :items-per-page="PAGE_SIZE"
          size="sm"
        />
      </div>
    </UCard>
  </DashboardWorkspacePage>
</template>
