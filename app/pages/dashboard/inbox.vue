<script setup lang="ts">
import {
  useInboxWorkspace,
  type InboxWorkspaceFilter,
  type InboxWorkspaceStatus
} from '~/composables/useInboxWorkspace'
import { normalizeInboxDto, normalizeThreadEventDto } from '~/utils/inbox-normalize'
import {
  getCategoryColor,
  getCategoryLabel,
  getSourceLabel,
  getStatusColor,
  getStatusLabel
} from '~/utils/inbox-thread'
import {
  dashboardCardUi,
  inboxThreadPanelUi,
  inboxWorkspacePanelUi
} from '~/utils/dashboard-ui'

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

const route = useRoute()
const toast = useToast()

const activeFilter = ref<InboxWorkspaceFilter>('ALL')
const search = ref('')
const selectedMessageId = ref<string | undefined>(
  typeof route.query.message === 'string' ? route.query.message : undefined
)

const {
  data: inboxWorkspace,
  pending: isLoading,
  error: inboxLoadError,
  refresh: refreshInbox,
  updateStatus,
  updateKind,
  sendReply: sendInboxReply
} = useInboxWorkspace({
  filter: activeFilter,
  search,
  selectedMessageId
})

const replyBody = ref('')
const composerMode = ref<'reply' | 'note'>('reply')
const isSendingReply = ref(false)
const isRefreshing = ref(false)

const messages = computed(() => inboxWorkspace.value.messages.map(normalizeInboxDto))

const selectedMessage = computed(() =>
  inboxWorkspace.value.selectedMessage
    ? normalizeInboxDto(inboxWorkspace.value.selectedMessage)
    : null
)

const selectedThreadEvents = computed(() =>
  inboxWorkspace.value.threadEvents.map(normalizeThreadEventDto)
)

const filters = computed(() => [
  { label: t('dashboard.inbox.filters.all'), value: 'ALL' as const },
  { label: t('dashboard.inbox.filters.needsReply'), value: 'NEEDS_REPLY' as const },
  { label: t('dashboard.inbox.filters.leads'), value: 'LEAD' as const },
  { label: t('dashboard.inbox.filters.replied'), value: 'REPLIED' as const },
  { label: t('dashboard.inbox.filters.archived'), value: 'ARCHIVED' as const },
  { label: t('dashboard.inbox.filters.spam'), value: 'SPAM' as const }
])

const summaryCards = computed(() => [
  {
    key: 'unread',
    label: t('dashboard.inbox.summary.unread'),
    value: inboxWorkspace.value.summary.unread,
    icon: 'i-lucide-mail',
    helper: t('dashboard.inbox.summary.unreadHelper')
  },
  {
    key: 'needs_reply',
    label: t('dashboard.inbox.summary.needsReply'),
    value: inboxWorkspace.value.summary.needsReply,
    icon: 'i-lucide-reply',
    helper: t('dashboard.inbox.summary.needsReplyHelper')
  },
  {
    key: 'leads',
    label: t('dashboard.inbox.summary.leads'),
    value: inboxWorkspace.value.summary.leads,
    icon: 'i-lucide-user-plus',
    helper: t('dashboard.inbox.summary.leadsHelper')
  },
  {
    key: 'archived',
    label: t('dashboard.inbox.summary.archived'),
    value: inboxWorkspace.value.summary.archived,
    icon: 'i-lucide-archive',
    helper: t('dashboard.inbox.summary.archivedHelper')
  }
])

watch(
  () => route.query.message,
  (messageId) => {
    selectedMessageId.value = typeof messageId === 'string' ? messageId : undefined
  }
)

watch(
  () => inboxWorkspace.value.messages,
  (currentMessages) => {
    if (!currentMessages.length) {
      if (route.query.message) {
        return
      }

      selectedMessageId.value = undefined
      return
    }

    const firstMessageId = currentMessages[0]?.id

    if (!selectedMessageId.value && !route.query.message && firstMessageId) {
      selectMessage(firstMessageId)
      return
    }

    const exists = currentMessages.some((message) => message.id === selectedMessageId.value)

    if (
      !exists &&
      !inboxWorkspace.value.selectedMessage &&
      !route.query.message &&
      firstMessageId
    ) {
      selectMessage(firstMessageId)
    }
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
    return 'Inbox database table is missing. Apply the inbox migration.'
  }

  if (message.includes('no such table: inbox_replies')) {
    return 'Inbox replies table is missing. Apply the inbox replies migration.'
  }

  return message
}

function selectMessage(id: string) {
  selectedMessageId.value = id

  navigateTo(
    {
      path: route.path,
      query: {
        ...route.query,
        message: id
      }
    },
    { replace: true }
  )
}

async function loadInbox() {
  isRefreshing.value = true

  try {
    await refreshInbox()

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

async function updateSelectedStatus(status: InboxWorkspaceStatus) {
  if (!selectedMessage.value) return

  try {
    await updateStatus(selectedMessage.value.id, status)

    toast.add({
      color: 'success',
      icon: 'i-lucide-check',
      title: t('dashboard.inbox.statusUpdated')
    })
  } catch (error) {
    toast.add({
      color: 'error',
      icon: 'i-lucide-circle-alert',
      title: getInboxErrorMessage(error)
    })
  }
}

function archiveSelected() {
  updateSelectedStatus('ARCHIVED')
}

function spamSelected() {
  updateSelectedStatus('SPAM')
}

function markSelectedDone() {
  updateSelectedStatus('REPLIED')
}

async function convertSelectedToLead() {
  if (!selectedMessage.value) return

  try {
    await updateKind(selectedMessage.value.id, 'LEAD')

    toast.add({
      color: 'success',
      icon: 'i-lucide-user-plus',
      title: t('dashboard.inbox.workspace.convertedToLead')
    })
  } catch (error) {
    toast.add({
      color: 'error',
      icon: 'i-lucide-circle-alert',
      title: getInboxErrorMessage(error)
    })
  }
}

function focusReplyComposer() {
  composerMode.value = 'reply'
}

async function sendReply() {
  if (!selectedMessage.value || !replyBody.value.trim()) {
    return
  }

  isSendingReply.value = true

  try {
    const result = await sendInboxReply(selectedMessage.value.id, replyBody.value.trim())

    replyBody.value = ''

    toast.add({
      color: result.status === 'FAILED' ? 'error' : 'success',
      icon: 'i-lucide-send',
      title:
        result.status === 'FAILED'
          ? result.error || t('dashboard.inbox.errors.replyFailed')
          : t('dashboard.inbox.errors.replyQueued')
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
        @click="loadInbox"
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
      class="grid  flex-1 gap-4 lg:sticky lg:top-8 lg:h-[calc(100dvh-4rem)] lg:grid-cols-[420px_1fr] lg:items-stretch"
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

        <div v-else-if="messages.length" class="divide-y divide-default">
          <DashboardInboxThreadRow
            v-for="message in messages"
            :key="message.id"
            :message="message"
            :selected="selectedMessageId === message.id"
            @select="selectMessage(message.id)"
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
                @click="markSelectedDone"
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
                @click="convertSelectedToLead"
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
            :is-sending-reply="isSendingReply"
            disable-notes
            @send-reply="sendReply"
          />

          <p class="text-xs text-muted">
            {{ t('dashboard.inbox.workspace.notesDisabled') }}
          </p>

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
