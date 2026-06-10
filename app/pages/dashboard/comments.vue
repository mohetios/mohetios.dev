<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'

import type { DashboardCommentDetail } from '~/components/dashboard/comments/Detail.vue'
import { dashboardCardUi } from '~/utils/dashboard-ui'
import { withDashboardRefresh } from '~/utils/dashboard-refresh'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth'],
  requiredPermission: 'comments:moderate'
})

const { t, locale } = useI18n()
const toast = useToast()
const route = useRoute()

useMohetiosSeo({
  title: () => t('dashboard.comments.title'),
  description: () => t('dashboard.comments.description'),
  noindex: true
})

type CommentStatus = DashboardCommentDetail['status']
type CommentRow = DashboardCommentDetail & { preview: string }

const search = ref('')
const statusFilter = ref<CommentStatus | 'ALL'>('PENDING')
const limit = ref(50)
const offset = ref(0)
const isRefreshing = ref(false)
const detailOpen = ref(false)
const selectedComment = ref<CommentRow | null>(null)
const editBody = ref('')
const isMutating = ref(false)

useDashboardPageToolbar({
  isRefreshing,
  onRefresh: () => refreshComments()
})

const statusItems = computed(() => [
  { label: t('dashboard.comments.allStatuses'), value: 'ALL' as const },
  { label: t('dashboard.comments.status.pending'), value: 'PENDING' as const },
  { label: t('dashboard.comments.status.approved'), value: 'APPROVED' as const },
  { label: t('dashboard.comments.status.spam'), value: 'SPAM' as const },
  { label: t('dashboard.comments.status.deleted'), value: 'DELETED' as const }
])

const queryInput = computed(() => ({
  search: search.value.trim() || null,
  status: statusFilter.value === 'ALL' ? null : statusFilter.value,
  limit: limit.value,
  offset: offset.value
}))

const {
  data: commentsData,
  pending: isLoading,
  error: loadError,
  refresh
} = await useAsyncData(
  'admin-comments',
  () => GqlAdminComments(queryInput.value),
  {
    watch: [queryInput]
  }
)

const connection = computed(() => commentsData.value?.adminComments)
const comments = computed(() => (connection.value?.items ?? []) as CommentRow[])
const summary = computed(
  () =>
    connection.value?.summary ?? {
      pending: 0,
      approved: 0,
      spam: 0,
      deleted: 0
    }
)

const summaryCards = computed(() => [
  {
    key: 'pending',
    label: t('dashboard.comments.summary.pending'),
    value: summary.value.pending,
    icon: 'i-lucide-clock',
    helper: t('dashboard.comments.status.pending')
  },
  {
    key: 'approved',
    label: t('dashboard.comments.summary.approved'),
    value: summary.value.approved,
    icon: 'i-lucide-check',
    helper: t('dashboard.comments.status.approved')
  },
  {
    key: 'spam',
    label: t('dashboard.comments.summary.spam'),
    value: summary.value.spam,
    icon: 'i-lucide-shield-alert',
    helper: t('dashboard.comments.status.spam')
  },
  {
    key: 'deleted',
    label: t('dashboard.comments.summary.deleted'),
    value: summary.value.deleted,
    icon: 'i-lucide-trash-2',
    helper: t('dashboard.comments.status.deleted')
  }
])

type BadgeColor = 'primary' | 'info' | 'success' | 'neutral' | 'warning' | 'error'

function getStatusColor(status: string): BadgeColor {
  return (
    (
      {
        PENDING: 'warning',
        APPROVED: 'success',
        SPAM: 'error',
        DELETED: 'neutral'
      } satisfies Record<string, BadgeColor>
    )[status] || 'neutral'
  )
}

function getStatusLabel(status: string) {
  const key = status.toLowerCase() as 'pending' | 'approved' | 'spam' | 'deleted'
  return t(`dashboard.comments.status.${key}`)
}

function formatDate(value?: number | null) {
  if (!value) return '—'

  return new Intl.DateTimeFormat(locale.value, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value))
}

function openDetail(comment: CommentRow) {
  selectedComment.value = comment
  editBody.value = comment.body
  detailOpen.value = true
}

function syncSelectedComment() {
  if (!selectedComment.value) return

  const next = comments.value.find((item) => item.id === selectedComment.value?.id)

  if (next) {
    selectedComment.value = next
    editBody.value = next.body
    return
  }

  detailOpen.value = false
  selectedComment.value = null
}

async function runMutation(action: () => Promise<unknown>, successKey: string) {
  isMutating.value = true

  try {
    await action()
    await refresh()
    syncSelectedComment()
    toast.add({
      color: 'success',
      icon: 'i-lucide-check',
      title: t(`dashboard.comments.mutations.${successKey}`)
    })
  } catch {
    toast.add({
      color: 'error',
      icon: 'i-lucide-circle-alert',
      title: t('dashboard.comments.mutations.failed')
    })
  } finally {
    isMutating.value = false
  }
}

async function approveSelected() {
  if (!selectedComment.value) return
  await runMutation(() => GqlApproveComment({ id: selectedComment.value!.id }), 'approveSuccess')
}

async function markSpamSelected() {
  if (!selectedComment.value) return
  await runMutation(
    () => GqlMarkCommentSpam({ id: selectedComment.value!.id, reason: null }),
    'spamSuccess'
  )
}

async function deleteSelected() {
  if (!selectedComment.value) return
  await runMutation(() => GqlDeleteComment({ id: selectedComment.value!.id }), 'deleteSuccess')
}

async function saveEdit() {
  if (!selectedComment.value) return

  await runMutation(
    () => GqlUpdateComment({ id: selectedComment.value!.id, body: editBody.value.trim() }),
    'updateSuccess'
  )
}

const columns = computed<TableColumn<CommentRow>[]>(() => [
  {
    accessorKey: 'createdAt',
    header: t('dashboard.comments.table.createdAt'),
    cell: ({ row }) =>
      h('span', { class: 'whitespace-nowrap text-xs text-muted tabular-nums' }, formatDate(row.original.createdAt))
  },
  {
    id: 'author',
    header: t('dashboard.comments.table.author'),
    cell: ({ row }) =>
      h('div', { class: 'min-w-[9rem] max-w-[12rem] py-0.5' }, [
        h('p', { class: 'truncate text-sm font-medium text-highlighted' }, row.original.authorName),
        h('p', { class: 'truncate text-xs text-muted' }, row.original.authorEmail)
      ])
  },
  {
    accessorKey: 'targetTitle',
    header: t('dashboard.comments.table.post'),
    cell: ({ row }) => {
      const NuxtLink = resolveComponent('NuxtLink')
      const UIcon = resolveComponent('UIcon')

      return h(
        NuxtLink,
        {
          to: row.original.targetPath,
          target: '_blank',
          class:
            'group inline-flex max-w-[10rem] items-center gap-1 text-sm text-primary hover:underline sm:max-w-[14rem]',
          title: row.original.targetTitle
        },
        () => [
          h('span', { class: 'truncate' }, row.original.targetTitle),
          h(UIcon, {
            name: 'i-lucide-external-link',
            class: 'size-3.5 shrink-0 opacity-60 group-hover:opacity-100'
          })
        ]
      )
    }
  },
  {
    accessorKey: 'preview',
    header: t('dashboard.comments.table.preview'),
    cell: ({ row }) =>
      h(
        'p',
        { class: 'line-clamp-2 max-w-[16rem] text-sm leading-5 text-muted sm:max-w-[22rem]' },
        row.original.preview
      )
  },
  {
    accessorKey: 'status',
    header: t('dashboard.comments.table.status'),
    cell: ({ row }) => {
      const UBadge = resolveComponent('UBadge')

      return h(
        UBadge,
        {
          color: getStatusColor(row.original.status),
          variant: 'soft',
          size: 'sm'
        },
        () => getStatusLabel(row.original.status)
      )
    }
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => {
      const UButton = resolveComponent('UButton')

      return h(
        UButton,
        {
          size: 'xs',
          variant: 'ghost',
          color: 'neutral',
          icon: 'i-lucide-panel-right-open',
          'aria-label': t('dashboard.comments.actions.open'),
          onClick: () => openDetail(row.original)
        }
      )
    }
  }
])

async function refreshComments() {
  try {
    await withDashboardRefresh(isRefreshing, () => refresh())
    syncSelectedComment()
    toast.add({
      color: 'success',
      icon: 'i-lucide-refresh-cw',
      title: t('dashboard.comments.refresh')
    })
  } catch {
    toast.add({
      color: 'error',
      icon: 'i-lucide-circle-alert',
      title: t('dashboard.comments.loadFailed')
    })
  }
}

watch([search, statusFilter], () => {
  offset.value = 0
})

watch(
  () => route.query.comment,
  (commentId) => {
    if (!commentId || typeof commentId !== 'string') return

    const match = comments.value.find((item) => item.id === commentId)

    if (match) {
      openDetail(match)
    }
  },
  { immediate: true }
)
</script>

<template>
  <DashboardWorkspacePage
    :title="t('dashboard.comments.title')"
    :description="t('dashboard.comments.description')"
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
          :placeholder="t('dashboard.comments.searchPlaceholder')"
        />

        <USelectMenu
          v-model="statusFilter"
          class="w-full sm:w-56"
          value-key="value"
          :items="statusItems"
          :placeholder="t('dashboard.comments.statusFilter')"
        />
      </div>

      <UAlert
        v-if="loadError"
        color="error"
        variant="soft"
        icon="i-lucide-circle-alert"
        :title="t('dashboard.comments.loadFailed')"
        class="mx-4 my-3"
      />

      <UTable
        :data="comments"
        :columns="columns"
        :loading="isLoading"
        :empty="t('dashboard.comments.empty')"
        class="w-full [&_td]:align-top [&_th]:whitespace-nowrap"
      />
    </UCard>

    <DashboardCommentsDrawer
      v-model:open="detailOpen"
      :comment="selectedComment"
      :edit-body="editBody"
      :mutating="isMutating"
      @update:edit-body="editBody = $event"
      @approve="approveSelected"
      @spam="markSpamSelected"
      @delete="deleteSelected"
      @save="saveEdit"
    />
  </DashboardWorkspacePage>
</template>
