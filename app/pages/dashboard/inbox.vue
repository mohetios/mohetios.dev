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

type InboxPushActionMessage = {
  type: 'inbox-action'
  action: 'read' | 'spam'
  entityId: string
}
let handleServiceWorkerMessage: ((event: MessageEvent) => void) | null = null

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
  return updateSelectedStatus('ARCHIVED')
}

function spamSelected() {
  return updateSelectedStatus('SPAM')
}

function markSelectedDone() {
  return updateSelectedStatus('REPLIED')
}

function markSelectedRead() {
  return updateSelectedStatus('OPEN')
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

function isInboxPushActionMessage(value: unknown): value is InboxPushActionMessage {
  if (!value || typeof value !== 'object') {
    return false
  }

  const message = value as Partial<InboxPushActionMessage>

  return (
    message.type === 'inbox-action' &&
    typeof message.entityId === 'string' &&
    (message.action === 'read' || message.action === 'spam')
  )
}

onMounted(() => {
  if (!('serviceWorker' in navigator)) {
    return
  }

  handleServiceWorkerMessage = (event: MessageEvent) => {
    if (!isInboxPushActionMessage(event.data)) {
      return
    }

    refreshInbox().catch((error) => {
      if (import.meta.dev) {
        console.error('[dashboard:inbox:push-refresh-failed]', error)
      }
    })
  }

  navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage)
})

onBeforeUnmount(() => {
  if (!handleServiceWorkerMessage || !('serviceWorker' in navigator)) {
    return
  }

  navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage)
  handleServiceWorkerMessage = null
})
</script>

<template>
  <DashboardWorkspacePage
    :title="t('dashboard.inbox.title')"
    :description="t('dashboard.inbox.description')"
  >
    <template #actions>
      <UButton
        color="neutral"
        variant="ghost"
        icon="i-lucide-refresh-cw"
        :loading="isRefreshing"
        size="sm"
        @click="loadInbox"
      >
        {{ t('dashboard.inbox.refresh') }}
      </UButton>
    </template>

    <template #summary>
      <DashboardWorkspaceSummary :items="summaryCards" :loading="isLoading" />
    </template>

    <template #filters>
      <DashboardWorkspaceFilterBar>
        <template #filters>
          <UButton
            v-for="filter in filters"
            :key="filter.value"
            :color="activeFilter === filter.value ? 'primary' : 'neutral'"
            :variant="activeFilter === filter.value ? 'soft' : 'ghost'"
            size="xs"
            @click="activeFilter = filter.value"
          >
            {{ filter.label }}
          </UButton>
        </template>

        <template #search>
          <UInput
            v-model="search"
            icon="i-lucide-search"
            :placeholder="t('dashboard.inbox.threads.search')"
            size="sm"
          />
        </template>
      </DashboardWorkspaceFilterBar>
    </template>

    <DashboardWorkspaceListPanel
      fill-height
      :title="t('dashboard.inbox.threads.title')"
      :description="t('dashboard.inbox.threads.description')"
      :loading="isLoading"
      :empty="!messages.length"
      :empty-title="t('dashboard.inbox.threads.emptyTitle')"
      :empty-description="t('dashboard.inbox.threads.emptyDescription')"
    >
      <div class="divide-y divide-default">
        <DashboardInboxThreadRow
          v-for="message in messages"
          :key="message.id"
          :message="message"
          :selected="selectedMessageId === message.id"
          @select="selectMessage(message.id)"
        />
      </div>
    </DashboardWorkspaceListPanel>

    <DashboardWorkspaceDetailPanel
      :empty="!selectedMessage"
      empty-icon="i-lucide-messages-square"
      :empty-title="t('dashboard.inbox.workspace.selectTitle')"
      :empty-description="t('dashboard.inbox.workspace.selectDescription')"
    >
      <template #header>
        <div v-if="selectedMessage" class="space-y-3">
          <div class="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
            <div class="min-w-0">
              <h2 class="truncate text-base font-semibold tracking-tight text-highlighted">
                {{ selectedMessage.subject }}
              </h2>

              <p class="mt-1 truncate text-sm text-muted">
                {{ selectedMessage.senderName }} · {{ selectedMessage.senderEmail }} ·
                {{ getSourceLabel(selectedMessage.source) }}
              </p>

              <div class="mt-2 flex flex-wrap gap-1.5">
                <UBadge :color="getCategoryColor(selectedMessage.kind)" variant="soft" size="sm">
                  {{ getCategoryLabel(selectedMessage.kind) }}
                </UBadge>

                <UBadge :color="getStatusColor(selectedMessage.status)" variant="subtle" size="sm">
                  {{ getStatusLabel(selectedMessage.status) }}
                </UBadge>
              </div>
            </div>

            <div class="flex shrink-0 flex-wrap gap-1.5">
              <UButton
                color="primary"
                variant="soft"
                icon="i-lucide-reply"
                size="xs"
                @click="focusReplyComposer"
              >
                {{ t('dashboard.inbox.workspace.reply') }}
              </UButton>

              <UButton
                color="neutral"
                variant="outline"
                icon="i-lucide-sparkles"
                size="xs"
                disabled
              >
                {{ t('dashboard.inbox.workspace.aiDraft') }}
              </UButton>

              <UButton
                v-if="selectedMessage.status === 'new'"
                color="neutral"
                variant="outline"
                icon="i-lucide-mail-open"
                size="xs"
                @click="markSelectedRead"
              >
                {{ t('dashboard.inbox.workspace.markRead') }}
              </UButton>

              <UButton
                color="success"
                variant="outline"
                icon="i-lucide-check"
                size="xs"
                @click="markSelectedDone"
              >
                {{ t('dashboard.inbox.workspace.markDone') }}
              </UButton>

              <UButton
                color="neutral"
                variant="ghost"
                icon="i-lucide-archive"
                size="xs"
                @click="archiveSelected"
              >
                {{ t('dashboard.inbox.workspace.archive') }}
              </UButton>

              <UButton
                color="error"
                variant="ghost"
                icon="i-lucide-octagon-alert"
                size="xs"
                @click="spamSelected"
              >
                {{ t('dashboard.inbox.workspace.spam') }}
              </UButton>

              <UButton
                color="neutral"
                variant="ghost"
                icon="i-lucide-user-plus"
                size="xs"
                @click="convertSelectedToLead"
              >
                {{ t('dashboard.inbox.workspace.convertToLead') }}
              </UButton>
            </div>
          </div>
        </div>
      </template>

      <div v-if="selectedMessage" class="space-y-5">
        <div class="space-y-3">
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

        <div class="grid gap-3 xl:grid-cols-2">
          <DashboardInboxDetailsCard :message="selectedMessage" />
          <DashboardInboxContactCard :message="selectedMessage" />
        </div>
      </div>
    </DashboardWorkspaceDetailPanel>
  </DashboardWorkspacePage>
</template>
