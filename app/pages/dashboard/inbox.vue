<script setup lang="ts">
import { useInboxWorkspace, type InboxWorkspaceStatus } from '~/composables/useInboxWorkspace'
import { normalizeInboxDto, normalizeThreadEventDto } from '~/utils/inbox-normalize'
import {
  getInboxTabI18nKey,
  inboxTabToFilter,
  parseInboxTab,
  parseUnreadOnly,
  PRIMARY_INBOX_TABS,
  SECONDARY_INBOX_TABS,
  type InboxTabItem,
  type InboxTabKey
} from '~/utils/inbox-tabs'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth'],
  requiredPermission: 'inbox:manage'
})

const { t } = useI18n()

useMohetiosSeo({
  title: () => t('dashboard.inbox.title'),
  description: () => t('dashboard.inbox.description'),
  noindex: true
})

const route = useRoute()
const toast = useToast()

const activeTab = computed(() => parseInboxTab(route.query.tab))
const activeFilter = computed(() => inboxTabToFilter[activeTab.value])
const unreadOnly = computed(() => parseUnreadOnly(route.query.unread, route.query.tab))

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
  sendReply: sendInboxReply,
  trashMessage,
  restoreMessage,
  deleteMessageForever
} = useInboxWorkspace({
  filter: activeFilter,
  unreadOnly,
  search,
  selectedMessageId
})

const replyBody = ref('')
const composerMode = ref<'reply' | 'note'>('reply')
const isSendingReply = ref(false)
const isRefreshing = ref(false)

useDashboardPageToolbar({
  isRefreshing,
  onRefresh: () => loadInbox()
})

const isConversationDrawerOpen = ref(false)
const canUseConversationDrawer = ref(false)
const isTrashConfirmOpen = ref(false)
const isDeleteForeverConfirmOpen = ref(false)
const isTrashActionPending = ref(false)
const isDeleteForeverPending = ref(false)
const pendingTrashMessageId = ref<string | null>(null)
const pendingDeleteForeverMessageId = ref<string | null>(null)

type InboxPushActionMessage = {
  type: 'inbox-action'
  action: 'read' | 'spam'
  entityId: string
}
let handleServiceWorkerMessage: ((event: MessageEvent) => void) | null = null

const messages = computed(() => inboxWorkspace.value.messages.map(normalizeInboxDto))
const hasInboxWorkspaceData = computed(() => {
  const summary = inboxWorkspace.value.summary

  return (
    summary.unread > 0 ||
    summary.needsReply > 0 ||
    summary.leads > 0 ||
    summary.archived > 0 ||
    summary.spam > 0 ||
    summary.trash > 0 ||
    summary.total > 0 ||
    inboxWorkspace.value.messages.length > 0 ||
    Boolean(inboxWorkspace.value.selectedMessage) ||
    inboxWorkspace.value.replies.length > 0 ||
    inboxWorkspace.value.threadEvents.length > 0
  )
})
const isInitialInboxLoading = computed(() => isLoading.value && !hasInboxWorkspaceData.value)

const isConversationLoading = computed(
  () => Boolean(selectedMessageId.value) && isLoading.value && !selectedMessage.value
)

const selectedMessage = computed(() =>
  inboxWorkspace.value.selectedMessage
    ? normalizeInboxDto(inboxWorkspace.value.selectedMessage)
    : null
)

const selectedThreadEvents = computed(() =>
  inboxWorkspace.value.threadEvents.map(normalizeThreadEventDto)
)

const unreadCount = computed(() => inboxWorkspace.value.summary.unread)

const tabCounts = computed<Partial<Record<InboxTabKey, number>>>(() => ({
  'needs-reply': inboxWorkspace.value.summary.needsReply,
  leads: inboxWorkspace.value.summary.leads,
  all: inboxWorkspace.value.summary.total,
  archived: inboxWorkspace.value.summary.archived,
  spam: inboxWorkspace.value.summary.spam,
  trash: inboxWorkspace.value.summary.trash
}))

const selectedHasReplies = computed(() => inboxWorkspace.value.replies.length > 0)

function buildTabItem(key: InboxTabKey): InboxTabItem {
  const count = tabCounts.value[key]

  return {
    key,
    label: t(`dashboard.inbox.tabs.${getInboxTabI18nKey(key)}`),
    count: count && count > 0 ? count : undefined
  }
}

const primaryTabs = computed(() => PRIMARY_INBOX_TABS.map(buildTabItem))
const secondaryTabs = computed(() => SECONDARY_INBOX_TABS.map(buildTabItem))

watch(
  () => route.query.tab,
  (tab) => {
    if (tab !== 'unread') {
      return
    }

    const { message, ...restQuery } = route.query

    navigateTo(
      {
        path: route.path,
        query: {
          ...restQuery,
          tab: 'all',
          unread: restQuery.unread || '1'
        }
      },
      { replace: true }
    )
  },
  { immediate: true }
)

watch(
  () => [route.query.tab, route.query.message] as const,
  ([, messageId]) => {
    selectedMessageId.value = typeof messageId === 'string' ? messageId : undefined
  },
  { immediate: true }
)

watch(
  () => inboxWorkspace.value.messages,
  (currentMessages) => {
    if (currentMessages.length || route.query.message) {
      return
    }

    selectedMessageId.value = undefined
  }
)

watch(
  () => selectedMessageId.value,
  (id) => {
    if (canUseConversationDrawer.value) {
      isConversationDrawerOpen.value = Boolean(id)
    }
  }
)

watch(isConversationDrawerOpen, (open) => {
  if (!canUseConversationDrawer.value) {
    return
  }

  if (!open && selectedMessageId.value) {
    closeConversation()
  }
})

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

  if (message.includes('no such column: trashed_at')) {
    return 'Inbox trash column is missing. Apply the inbox trash migration.'
  }

  return message
}

function inboxQueryFromRoute(overrides: Record<string, string | undefined> = {}) {
  const query: Record<string, string> = {}
  const removedKeys = new Set(
    Object.entries(overrides)
      .filter(([, value]) => value === undefined)
      .map(([key]) => key)
  )

  for (const [key, value] of Object.entries(route.query)) {
    if (typeof value === 'string' && !removedKeys.has(key)) {
      query[key] = value
    }
  }

  for (const [key, value] of Object.entries(overrides)) {
    if (value !== undefined) {
      query[key] = value
    }
  }

  return query
}

function selectTab(tab: InboxTabKey) {
  navigateTo(
    {
      path: route.path,
      query: inboxQueryFromRoute({ tab, message: undefined })
    },
    { replace: false }
  )
}

function setUnreadOnly(value: boolean) {
  navigateTo(
    {
      path: route.path,
      query: inboxQueryFromRoute({
        unread: value ? '1' : undefined,
        message: undefined
      })
    },
    { replace: false }
  )
}

function selectMessage(id: string) {
  selectedMessageId.value = id

  navigateTo(
    {
      path: route.path,
      query: {
        ...route.query,
        tab: activeTab.value,
        message: id
      }
    },
    { replace: false }
  )
}

function closeConversation() {
  selectedMessageId.value = undefined

  const { message, ...restQuery } = route.query

  navigateTo(
    {
      path: route.path,
      query: restQuery
    },
    { replace: true }
  )
}

async function loadInbox() {
  try {
    await withDashboardRefresh(isRefreshing, () => refreshInbox())
    await refreshNuxtData('dashboard:nav-counts')

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
  }
}

async function updateMessageStatus(id: string, status: InboxWorkspaceStatus) {
  selectMessage(id)

  try {
    await updateStatus(id, status)

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

function updateSelectedStatus(status: InboxWorkspaceStatus) {
  if (!selectedMessage.value) return
  return updateMessageStatus(selectedMessage.value.id, status)
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

  return convertMessageToLead(selectedMessage.value.id)
}

async function convertMessageToLead(id: string) {
  selectMessage(id)

  try {
    await updateKind(id, 'LEAD')

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

function requestMoveToTrash() {
  if (!selectedMessage.value) return

  if (selectedHasReplies.value) {
    pendingTrashMessageId.value = selectedMessage.value.id
    isTrashConfirmOpen.value = true
    return
  }

  return trashMessageById(selectedMessage.value.id)
}

function requestMoveMessageToTrash(id: string) {
  selectMessage(id)
  pendingTrashMessageId.value = id
  isTrashConfirmOpen.value = true
}

function cancelMoveToTrash() {
  isTrashConfirmOpen.value = false
  pendingTrashMessageId.value = null
}

async function trashMessageById(id: string) {
  selectMessage(id)

  isTrashActionPending.value = true

  try {
    await trashMessage(id)

    toast.add({
      color: 'success',
      icon: 'i-lucide-trash-2',
      title: t('dashboard.inbox.workspace.movedToTrash')
    })

    isTrashConfirmOpen.value = false
    pendingTrashMessageId.value = null
    closeConversation()
    await refreshInbox()
  } catch (error) {
    toast.add({
      color: 'error',
      icon: 'i-lucide-circle-alert',
      title: getInboxErrorMessage(error)
    })
  } finally {
    isTrashActionPending.value = false
  }
}

function trashSelected() {
  const id = pendingTrashMessageId.value || selectedMessage.value?.id

  if (!id) return

  return trashMessageById(id)
}

async function restoreSelected() {
  if (!selectedMessage.value) return

  return restoreMessageById(selectedMessage.value.id)
}

async function restoreMessageById(id: string) {
  selectMessage(id)

  try {
    await restoreMessage(id)

    toast.add({
      color: 'success',
      icon: 'i-lucide-rotate-ccw',
      title: t('dashboard.inbox.workspace.restoredFromTrash')
    })

    closeConversation()
    await refreshInbox()
  } catch (error) {
    toast.add({
      color: 'error',
      icon: 'i-lucide-circle-alert',
      title: getInboxErrorMessage(error)
    })
  }
}

function requestDeleteForever() {
  if (!selectedMessage.value) return

  pendingDeleteForeverMessageId.value = selectedMessage.value.id
  isDeleteForeverConfirmOpen.value = true
}

function requestDeleteMessageForever(id: string) {
  selectMessage(id)
  pendingDeleteForeverMessageId.value = id
  isDeleteForeverConfirmOpen.value = true
}

function cancelDeleteForever() {
  isDeleteForeverConfirmOpen.value = false
  pendingDeleteForeverMessageId.value = null
}

async function deleteMessageForeverById(id: string) {
  selectMessage(id)

  isDeleteForeverPending.value = true

  try {
    await deleteMessageForever(id)

    toast.add({
      color: 'success',
      icon: 'i-lucide-trash',
      title: t('dashboard.inbox.workspace.deletedForever')
    })

    isDeleteForeverConfirmOpen.value = false
    pendingDeleteForeverMessageId.value = null
    closeConversation()
    await refreshInbox()
  } catch (error) {
    toast.add({
      color: 'error',
      icon: 'i-lucide-circle-alert',
      title: getInboxErrorMessage(error)
    })
  } finally {
    isDeleteForeverPending.value = false
  }
}

function deleteSelectedForever() {
  const id = pendingDeleteForeverMessageId.value || selectedMessage.value?.id

  if (!id) return

  return deleteMessageForeverById(id)
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

function replyToMessage(id: string) {
  selectMessage(id)
  composerMode.value = 'reply'
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
  if (import.meta.client) {
    const mediaQuery = window.matchMedia('(max-width: 1023px)')

    const syncDrawerViewport = () => {
      canUseConversationDrawer.value = mediaQuery.matches

      if (mediaQuery.matches) {
        isConversationDrawerOpen.value = Boolean(selectedMessageId.value)
      } else {
        isConversationDrawerOpen.value = false
      }
    }

    syncDrawerViewport()
    mediaQuery.addEventListener('change', syncDrawerViewport)

    onBeforeUnmount(() => {
      mediaQuery.removeEventListener('change', syncDrawerViewport)
    })
  }

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
    grid-class="lg:grid-cols-[minmax(500px,580px)_minmax(0,1fr)]"
  >
    <DashboardInboxThreads
      :primary-tabs="primaryTabs"
      :secondary-tabs="secondaryTabs"
      :active-tab="activeTab"
      :unread-only="unreadOnly"
      :unread-count="unreadCount"
      :messages="messages"
      :search="search"
      :loading="isInitialInboxLoading"
      :selected-message-id="selectedMessageId"
      @update:search="search = $event"
      @select-tab="selectTab"
      @update:unread-only="setUnreadOnly"
      @select-message="selectMessage"
      @reply-message="replyToMessage"
      @mark-message-read="updateMessageStatus($event, 'OPEN')"
      @mark-message-done="updateMessageStatus($event, 'REPLIED')"
      @archive-message="updateMessageStatus($event, 'ARCHIVED')"
      @spam-message="updateMessageStatus($event, 'SPAM')"
      @convert-message-to-lead="convertMessageToLead"
      @move-message-to-trash="requestMoveMessageToTrash"
      @restore-message="restoreMessageById"
      @delete-message-forever="requestDeleteMessageForever"
    />

    <DashboardInboxConversation
      :message="selectedMessage"
      :events="selectedThreadEvents"
      :reply-body="replyBody"
      :composer-mode="composerMode"
      :is-sending-reply="isSendingReply"
      :loading="isConversationLoading"
      @send-reply="sendReply"
      @update:reply-body="replyBody = $event"
      @update:composer-mode="composerMode = $event"
      @mark-read="markSelectedRead"
      @mark-done="markSelectedDone"
      @archive="archiveSelected"
      @spam="spamSelected"
      @convert-to-lead="convertSelectedToLead"
      @move-to-trash="requestMoveToTrash"
      @restore="restoreSelected"
      @delete-forever="requestDeleteForever"
    />

    <DashboardInboxConversationDrawer
      v-if="canUseConversationDrawer"
      v-model:open="isConversationDrawerOpen"
      :message="selectedMessage"
      :events="selectedThreadEvents"
      :reply-body="replyBody"
      :composer-mode="composerMode"
      :is-sending-reply="isSendingReply"
      :loading="isConversationLoading"
      @close="closeConversation"
      @send-reply="sendReply"
      @update:reply-body="replyBody = $event"
      @update:composer-mode="composerMode = $event"
      @mark-read="markSelectedRead"
      @mark-done="markSelectedDone"
      @archive="archiveSelected"
      @spam="spamSelected"
      @convert-to-lead="convertSelectedToLead"
      @move-to-trash="requestMoveToTrash"
      @restore="restoreSelected"
      @delete-forever="requestDeleteForever"
    />

    <DashboardInboxConfirm
      v-model:open="isTrashConfirmOpen"
      :title="t('dashboard.inbox.confirmTrash.title')"
      :description="t('dashboard.inbox.confirmTrash.description')"
      :confirm-label="t('dashboard.inbox.confirmTrash.confirm')"
      :loading="isTrashActionPending"
      @confirm="trashSelected"
      @cancel="cancelMoveToTrash"
    />

    <DashboardInboxConfirm
      v-model:open="isDeleteForeverConfirmOpen"
      :title="t('dashboard.inbox.confirmDeleteForever.title')"
      :description="t('dashboard.inbox.confirmDeleteForever.description')"
      :confirm-label="t('dashboard.inbox.confirmDeleteForever.confirm')"
      destructive
      :loading="isDeleteForeverPending"
      @confirm="deleteSelectedForever"
      @cancel="cancelDeleteForever"
    />
  </DashboardWorkspacePage>
</template>
