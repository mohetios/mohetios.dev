<script setup lang="ts">
import type { InboxMessage, InboxStatus, InboxThreadEvent } from '~/utils/inbox-thread'
import {
  getCategoryColor,
  getCategoryLabel,
  getSourceLabel,
  getStatusColor,
  getStatusLabel,
  getThreadEvents,
  matchesActiveFilter,
  normalizeInboxMessage
} from '~/utils/inbox-thread'
import {
  dashboardCardUi,
  inboxThreadPanelUi,
  inboxWorkspacePanelUi
} from '~/utils/dashboard-ui'

type GraphqlResponse<T> = {
  data?: T
  errors?: Array<{ message?: string }>
}

type InboxMessagesQuery = {
  inboxMessages: Array<{
    id: string
    source: string
    status: string
    kind: string
    senderName: string
    senderEmail: string
    subject: string
    preview: string
    bodyText: string
    senderCompany?: string | null
    senderWebsite?: string | null
    createdAt: number
    updatedAt: number
  }>
}

type UpdateInboxMessageStatusMutation = {
  updateInboxMessageStatus: InboxMessagesQuery['inboxMessages'][number]
}

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth'],
  requiredPermission: 'inbox:manage'
})

const { t } = useI18n()

useMohetSeo({
  title: () => t('dashboard.inbox.title'),
  description: () => t('dashboard.inbox.description')
})

const filters = computed(() => [
  { label: t('dashboard.inbox.filters.all'), value: 'all' as const },
  { label: t('dashboard.inbox.filters.needsReply'), value: 'needs_reply' as const },
  { label: t('dashboard.inbox.filters.leads'), value: 'lead' as const },
  { label: t('dashboard.inbox.filters.replied'), value: 'replied' as const },
  { label: t('dashboard.inbox.filters.archived'), value: 'archived' as const },
  { label: t('dashboard.inbox.filters.spam'), value: 'spam' as const }
])

const activeFilter = ref<(typeof filters.value)[number]['value']>('all')
const search = ref('')
const replyBody = ref('')
const noteBody = ref('')
const composerMode = ref<'reply' | 'note'>('reply')
const isSendingReply = ref(false)
const isRefreshing = ref(false)
const toast = useToast()
const route = useRoute()

const messages = ref<InboxMessage[]>([])
const localThreadNotes = ref<Record<string, InboxThreadEvent[]>>({})

const {
  data: loadedMessages,
  pending: isLoading,
  error: inboxLoadError,
  refresh: refreshInboxMessages
} = await useAsyncData<InboxMessage[]>(
  'dashboard:inbox-messages',
  async () => {
    const result = await requestInboxGraphql<InboxMessagesQuery>(`
      query InboxMessages {
        inboxMessages {
          id
          source
          status
          kind
          senderName
          senderEmail
          subject
          preview
          bodyText
          senderCompany
          senderWebsite
          createdAt
          updatedAt
        }
      }
    `)

    return result.inboxMessages.map(normalizeInboxMessage)
  },
  {
    default: () => []
  }
)

const selectedMessageId = ref<string | undefined>()
const selectedMessage = computed(
  () => messages.value.find((message) => message.id === selectedMessageId.value) || null
)

const unreadCount = computed(() =>
  messages.value.filter((message) => message.status === 'new').length
)

const needsReplyCount = computed(() =>
  messages.value.filter((message) => ['new', 'open'].includes(message.status)).length
)

const leadCount = computed(() =>
  messages.value.filter((message) => ['lead', 'collaboration'].includes(message.kind)).length
)

const archivedCount = computed(() =>
  messages.value.filter((message) => message.status === 'archived').length
)

const summaryCards = computed(() => [
  {
    key: 'unread',
    label: t('dashboard.inbox.summary.unread'),
    value: unreadCount.value,
    icon: 'i-lucide-mail',
    helper: t('dashboard.inbox.summary.unreadHelper')
  },
  {
    key: 'needs_reply',
    label: t('dashboard.inbox.summary.needsReply'),
    value: needsReplyCount.value,
    icon: 'i-lucide-reply',
    helper: t('dashboard.inbox.summary.needsReplyHelper')
  },
  {
    key: 'leads',
    label: t('dashboard.inbox.summary.leads'),
    value: leadCount.value,
    icon: 'i-lucide-user-plus',
    helper: t('dashboard.inbox.summary.leadsHelper')
  },
  {
    key: 'archived',
    label: t('dashboard.inbox.summary.archived'),
    value: archivedCount.value,
    icon: 'i-lucide-archive',
    helper: t('dashboard.inbox.summary.archivedHelper')
  }
])

const filteredMessages = computed(() => {
  const query = search.value.trim().toLowerCase()

  return messages.value.filter((message) => {
    const haystack = [message.senderName, message.senderEmail, message.subject, message.preview]
      .join(' ')
      .toLowerCase()

    return (
      matchesActiveFilter(message, activeFilter.value) && (!query || haystack.includes(query))
    )
  })
})

const selectedThreadEvents = computed(() => {
  if (!selectedMessage.value) return []

  return [
    ...getThreadEvents(selectedMessage.value),
    ...(localThreadNotes.value[selectedMessage.value.id] || [])
  ].sort((a, b) => a.createdAt - b.createdAt)
})

watch(
  loadedMessages,
  (currentMessages) => {
    messages.value = currentMessages || []

    if (!messages.value.some((message) => message.id === selectedMessageId.value)) {
      const routeMessageId = typeof route.query.message === 'string' ? route.query.message : null
      selectedMessageId.value =
        messages.value.find((message) => message.id === routeMessageId)?.id || messages.value[0]?.id
    }
  },
  { immediate: true }
)

watch(
  filteredMessages,
  (currentMessages) => {
    if (currentMessages.some((message) => message.id === selectedMessageId.value)) {
      return
    }

    selectedMessageId.value = currentMessages[0]?.id
  },
  { immediate: true }
)

watch(inboxLoadError, (error) => {
  if (!error || import.meta.server) {
    return
  }

  if (import.meta.dev) {
    console.error('[dashboard:inbox:load-error]', error)
  }

  toast.add({
    color: 'error',
    icon: 'i-lucide-circle-alert',
    title: getInboxErrorMessage(error)
  })
})

function getInboxErrorMessage(error: unknown) {
  if (!error || typeof error !== 'object') {
    return t('dashboard.inbox.errors.loadFailed')
  }

  const currentError = error as {
    data?: { message?: string; statusMessage?: string }
    message?: string
    statusMessage?: string
  }
  const message =
    currentError.data?.message ||
    currentError.data?.statusMessage ||
    currentError.statusMessage ||
    currentError.message

  if (!message) {
    return t('dashboard.inbox.errors.loadFailed')
  }

  if (message.includes('no such table: inbox_messages')) {
    return 'Inbox database table is missing. Apply the latest migration.'
  }

  return message
}

async function requestInboxGraphql<T>(query: string, variables: Record<string, unknown> = {}) {
  const auth = useAuth()
  const token = auth.restoreToken()

  const response = await $fetch<GraphqlResponse<T>>('/graph', {
    method: 'POST',
    headers: token
      ? {
          Authorization: `Bearer ${token}`
        }
      : undefined,
    body: {
      query,
      variables
    }
  })

  if (response.errors?.length) {
    throw new Error(response.errors[0]?.message || 'GraphQL request failed')
  }

  if (!response.data) {
    throw new Error('GraphQL request failed')
  }

  return response.data
}

async function loadMessages() {
  isRefreshing.value = true

  try {
    await refreshInboxMessages()

    if (inboxLoadError.value) {
      throw inboxLoadError.value
    }
  } catch (error) {
    if (import.meta.dev) {
      console.error('[dashboard:inbox:load-error]', error)
    }

    toast.add({
      color: 'error',
      icon: 'i-lucide-circle-alert',
      title: getInboxErrorMessage(error)
    })
  } finally {
    isRefreshing.value = false
  }
}

async function updateSelectedStatus(status: InboxStatus) {
  const message = messages.value.find((item) => item.id === selectedMessageId.value)

  if (!message) {
    return
  }

  const previousStatus = message.status
  message.status = status

  try {
    const result = await requestInboxGraphql<UpdateInboxMessageStatusMutation>(
      `
        mutation UpdateInboxMessageStatus($id: ID!, $status: InboxStatus!) {
          updateInboxMessageStatus(id: $id, status: $status) {
            id
            source
            status
            kind
            senderName
            senderEmail
            subject
            preview
            bodyText
            senderCompany
            senderWebsite
            createdAt
            updatedAt
          }
        }
      `,
      {
        id: message.id,
        status: status.toUpperCase()
      }
    )
    const updated = normalizeInboxMessage(result.updateInboxMessageStatus)
    const index = messages.value.findIndex((item) => item.id === updated.id)

    if (index !== -1) {
      messages.value[index] = updated
    }
  } catch (error) {
    message.status = previousStatus

    if (import.meta.dev) {
      console.error('[dashboard:inbox:status-error]', error)
    }

    toast.add({
      color: 'error',
      icon: 'i-lucide-circle-alert',
      title: getInboxErrorMessage(error)
    })
  }
}

function archiveSelected() {
  updateSelectedStatus('archived')
}

function spamSelected() {
  updateSelectedStatus('spam')
}

function focusReplyComposer() {
  composerMode.value = 'reply'
}

function addPrivateNote() {
  if (!selectedMessage.value || !noteBody.value.trim()) return

  const note: InboxThreadEvent = {
    id: `${selectedMessage.value.id}:note:${Date.now()}`,
    type: 'internal_note',
    authorName: 'Mohetios',
    bodyText: noteBody.value.trim(),
    time: 'just now',
    createdAt: Date.now(),
    isPrivate: true,
    deliveryStatus: 'not_applicable'
  }

  localThreadNotes.value[selectedMessage.value.id] = [
    ...(localThreadNotes.value[selectedMessage.value.id] || []),
    note
  ]

  noteBody.value = ''
}

async function sendReply() {
  if (!selectedMessage.value || !replyBody.value.trim()) {
    return
  }

  const sentBody = replyBody.value.trim()
  const messageId = selectedMessage.value.id
  isSendingReply.value = true

  try {
    await requestInboxGraphql(
      `
        mutation ReplyToInboxMessage($input: ReplyToInboxMessageInput!) {
          replyToInboxMessage(input: $input) {
            id
            status
            error
          }
        }
      `,
      {
        input: {
          inboxMessageId: messageId,
          bodyText: sentBody
        }
      }
    )

    const replyEvent: InboxThreadEvent = {
      id: `${messageId}:reply:${Date.now()}`,
      type: 'outbound_reply',
      authorName: 'Mohetios',
      bodyText: sentBody,
      time: 'just now',
      createdAt: Date.now(),
      deliveryStatus: 'sent'
    }

    localThreadNotes.value[messageId] = [
      ...(localThreadNotes.value[messageId] || []),
      replyEvent
    ]

    replyBody.value = ''
    await loadMessages()

    toast.add({
      color: 'success',
      icon: 'i-lucide-send',
      title: t('dashboard.inbox.errors.replySent')
    })
  } catch (error) {
    toast.add({
      color: 'error',
      icon: 'i-lucide-circle-alert',
      title: getInboxErrorMessage(error)
    })
  } finally {
    isSendingReply.value = false
  }
}
</script>

<template>
  <div class="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 flex-col gap-6">
    <section class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div class="flex min-w-0 items-start gap-3">
        <UDashboardSidebarCollapse class="shrink-0 lg:hidden" />

        <div>
          <h1 class="text-3xl font-semibold tracking-tight text-highlighted">
            {{ t('dashboard.inbox.title') }}
          </h1>
          <p class="mt-1 text-sm text-muted">
            {{ t('dashboard.inbox.description') }}
          </p>
        </div>
      </div>

      <UButton
        color="neutral"
        variant="ghost"
        icon="i-lucide-refresh-cw"
        :loading="isRefreshing"
        @click="loadMessages"
      >
        {{ t('dashboard.inbox.refresh') }}
      </UButton>
    </section>

    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <DashboardInboxSummaryCard
        v-for="card in summaryCards"
        :key="card.key"
        :label="card.label"
        :value="card.value"
        :icon="card.icon"
        :helper="card.helper"
      />
    </section>

    <section
      class="flex flex-col gap-3 rounded-2xl border border-default bg-default p-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div class="flex flex-wrap items-center gap-2">
        <UButton
          v-for="filter in filters"
          :key="filter.value"
          :color="activeFilter === filter.value ? 'primary' : 'neutral'"
          :variant="activeFilter === filter.value ? 'soft' : 'ghost'"
          size="sm"
          @click="activeFilter = filter.value"
        >
          {{ filter.label }}
        </UButton>
      </div>

      <UInput
        v-model="search"
        icon="i-lucide-search"
        :placeholder="t('dashboard.inbox.threads.search')"
        class="w-full sm:w-72"
      />
    </section>

    <section
      class="grid min-h-0 flex-1 gap-4 lg:sticky lg:top-8 lg:h-[calc(100dvh-4rem)] lg:grid-cols-[420px_1fr] lg:items-stretch"
    >
      <UCard :ui="inboxThreadPanelUi">
        <template #header>
          <div>
            <h2 class="text-sm font-semibold text-highlighted">
              {{ t('dashboard.inbox.threads.title') }}
            </h2>
            <p class="text-xs text-muted">
              {{ t('dashboard.inbox.threads.description') }}
            </p>
          </div>
        </template>

        <div v-if="isLoading" class="space-y-3 p-4">
          <USkeleton v-for="item in 5" :key="item" class="h-24 w-full" />
        </div>

        <div v-else-if="filteredMessages.length" class="divide-y divide-default">
          <DashboardInboxThreadRow
            v-for="message in filteredMessages"
            :key="message.id"
            :message="message"
            :selected="selectedMessageId === message.id"
            @select="selectedMessageId = message.id"
          />
        </div>

        <div v-else class="p-8 text-center">
          <div class="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-muted">
            <UIcon name="i-lucide-inbox" class="size-5 text-muted" />
          </div>
          <h3 class="text-sm font-medium text-highlighted">
            {{ t('dashboard.inbox.threads.emptyTitle') }}
          </h3>
          <p class="mt-1 text-sm text-muted">
            {{ t('dashboard.inbox.threads.emptyDescription') }}
          </p>
        </div>
      </UCard>

      <UCard v-if="selectedMessage" :ui="inboxWorkspacePanelUi">
        <template #header>
          <div class="space-y-4">
            <div class="min-w-0">
              <h2 class="text-lg font-semibold tracking-tight text-highlighted">
                {{ selectedMessage.subject }}
              </h2>
              <p class="mt-1 text-sm text-muted">
                {{ selectedMessage.senderName }} · {{ selectedMessage.senderEmail }} ·
                {{ getSourceLabel(selectedMessage.source) }}
              </p>
              <div class="mt-2 flex flex-wrap gap-2">
                <UBadge :color="getCategoryColor(selectedMessage.kind)" variant="soft">
                  {{ getCategoryLabel(selectedMessage.kind) }}
                </UBadge>
                <UBadge :color="getStatusColor(selectedMessage.status)" variant="subtle">
                  {{ getStatusLabel(selectedMessage.status) }}
                </UBadge>
              </div>
            </div>

            <div class="flex flex-wrap gap-2">
              <UButton
                color="primary"
                variant="soft"
                icon="i-lucide-reply"
                size="sm"
                @click="focusReplyComposer"
              >
                {{ t('dashboard.inbox.workspace.reply') }}
              </UButton>
              <UButton color="neutral" variant="outline" icon="i-lucide-sparkles" size="sm" disabled>
                {{ t('dashboard.inbox.workspace.aiDraft') }}
              </UButton>
              <UButton
                color="success"
                variant="outline"
                icon="i-lucide-check"
                size="sm"
                @click="updateSelectedStatus('replied')"
              >
                {{ t('dashboard.inbox.workspace.markDone') }}
              </UButton>
              <UButton
                color="neutral"
                variant="ghost"
                icon="i-lucide-archive"
                size="sm"
                @click="archiveSelected"
              >
                {{ t('dashboard.inbox.workspace.archive') }}
              </UButton>
              <UButton
                color="error"
                variant="ghost"
                icon="i-lucide-octagon-alert"
                size="sm"
                @click="spamSelected"
              >
                {{ t('dashboard.inbox.workspace.spam') }}
              </UButton>
              <UButton
                color="neutral"
                variant="ghost"
                icon="i-lucide-user-plus"
                size="sm"
                disabled
              >
                {{ t('dashboard.inbox.workspace.convertToLead') }}
              </UButton>
            </div>
          </div>
        </template>

        <div class="space-y-6">
          <div class="space-y-4">
            <DashboardInboxTimelineEvent
              v-for="event in selectedThreadEvents"
              :key="event.id"
              :event="event"
            />
          </div>

          <DashboardInboxComposer
            v-model:composer-mode="composerMode"
            v-model:reply-body="replyBody"
            v-model:note-body="noteBody"
            :is-sending-reply="isSendingReply"
            @send-reply="sendReply"
            @add-private-note="addPrivateNote"
          />

          <div class="grid gap-4 lg:grid-cols-2">
            <DashboardInboxDetailsCard :message="selectedMessage" />
            <DashboardInboxContactCard :message="selectedMessage" />
          </div>
        </div>
      </UCard>

      <UCard
        v-else
        :ui="dashboardCardUi"
        class="flex min-h-[calc(100dvh-18rem)] items-center justify-center lg:h-full lg:min-h-0"
      >
        <div class="max-w-sm p-8 text-center">
          <div class="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
            <UIcon name="i-lucide-messages-square" class="size-6 text-muted" />
          </div>
          <h2 class="text-base font-semibold text-highlighted">
            {{ t('dashboard.inbox.workspace.selectTitle') }}
          </h2>
          <p class="mt-2 text-sm text-muted">
            {{ t('dashboard.inbox.workspace.selectDescription') }}
          </p>
        </div>
      </UCard>
    </section>
  </div>
</template>
