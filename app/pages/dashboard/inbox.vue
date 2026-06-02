<script setup lang="ts">
type InboxCategory = 'lead' | 'job' | 'freelance' | 'general' | 'system'
type InboxStatus = 'unread' | 'read' | 'archived' | 'spam'
type InboxChannel = 'contact_form' | 'email' | 'system' | 'manual'
type BadgeColor = 'primary' | 'info' | 'success' | 'neutral' | 'warning' | 'error'

type InboxMessage = {
  id: string
  channel: InboxChannel
  fromName: string
  fromEmail: string
  subject: string
  preview: string
  body: string
  category: InboxCategory
  status: InboxStatus
  time: string
  source: string
  topic?: string | null
  company?: string | null
  website?: string | null
  createdAt: string
}

type GraphqlResponse<T> = {
  data?: T
  errors?: Array<{ message?: string }>
}

type InboxMessagesQuery = {
  inboxMessages: Array<{
    id: string
    channel: string
    status: string
    category: string
    fromName: string
    fromEmail: string
    subject: string
    preview: string
    body: string
    topic?: string | null
    company?: string | null
    website?: string | null
    source?: string | null
    createdAt: string
    updatedAt: string
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

useMohetSeo({
  title: 'Inbox',
  description: 'Private dashboard mailbox for reviewing messages and lead candidates.'
})

const filters = [
  { label: 'All', value: 'all' },
  { label: 'Unread', value: 'unread' },
  { label: 'Leads', value: 'lead' },
  { label: 'Archived', value: 'archived' },
  { label: 'Spam', value: 'spam' }
] as const
const categoryOptions = ['All categories', 'Lead', 'Job', 'Freelance', 'General', 'System']

const activeFilter = ref<(typeof filters)[number]['value']>('all')
const search = ref('')
const categoryFilter = ref('All categories')
const internalNote = ref('')
const isRefreshing = ref(false)
const toast = useToast()

const messages = ref<InboxMessage[]>([])
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
          channel
          status
          category
          fromName
          fromEmail
          subject
          preview
          body
          topic
          company
          website
          source
          createdAt
          updatedAt
        }
      }
    `)

    return result.inboxMessages.map(normalizeMessage)
  },
  {
    default: () => []
  }
)

const selectedMessageId = ref<string | undefined>()
const selectedMessage = computed(
  () => messages.value.find((message) => message.id === selectedMessageId.value) || null
)
const unreadCount = computed(
  () => messages.value.filter((message) => message.status === 'unread').length
)
const filteredMessages = computed(() => {
  const query = search.value.trim().toLowerCase()
  const selectedCategory = categoryFilter.value.toLowerCase()

  return messages.value.filter((message) => {
    const matchesFilter =
      activeFilter.value === 'all' ||
      message.status === activeFilter.value ||
      message.category === activeFilter.value
    const matchesCategory =
      selectedCategory === 'all categories' || message.category === selectedCategory
    const haystack = [message.fromName, message.fromEmail, message.subject, message.preview]
      .join(' ')
      .toLowerCase()

    return matchesFilter && matchesCategory && (!query || haystack.includes(query))
  })
})

watch(
  loadedMessages,
  (currentMessages) => {
    messages.value = currentMessages || []

    if (!messages.value.some((message) => message.id === selectedMessageId.value)) {
      selectedMessageId.value = messages.value[0]?.id
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

function getCategoryLabel(category: InboxCategory) {
  return category.charAt(0).toUpperCase() + category.slice(1)
}

function getCategoryColor(category: InboxCategory): BadgeColor {
  return (
    {
      lead: 'primary',
      job: 'info',
      freelance: 'success',
      general: 'neutral',
      system: 'warning'
    } satisfies Record<InboxCategory, BadgeColor>
  )[category]
}

function getStatusLabel(status: InboxStatus) {
  return (
    {
      unread: 'Unread',
      read: 'Read',
      archived: 'Archived',
      spam: 'Spam'
    } satisfies Record<InboxStatus, string>
  )[status]
}

function getStatusColor(status: InboxStatus): BadgeColor {
  return (
    {
      unread: 'primary',
      read: 'neutral',
      archived: 'neutral',
      spam: 'error'
    } satisfies Record<InboxStatus, BadgeColor>
  )[status]
}

function getChannelLabel(channel: InboxChannel) {
  return (
    {
      contact_form: 'Contact form',
      email: 'Email',
      system: 'System',
      manual: 'Manual'
    } satisfies Record<InboxChannel, string>
  )[channel]
}

function normalizeMessage(message: {
  id: string
  channel: string
  status: string
  category: string
  fromName: string
  fromEmail: string
  subject: string
  preview: string
  body: string
  topic?: string | null
  company?: string | null
  website?: string | null
  source?: string | null
  createdAt: string
}) {
  const channel = message.channel.toLowerCase() as InboxChannel

  return {
    id: message.id,
    channel,
    fromName: message.fromName,
    fromEmail: message.fromEmail,
    subject: message.subject,
    preview: message.preview,
    body: message.body,
    category: message.category.toLowerCase() as InboxCategory,
    status: message.status.toLowerCase() as InboxStatus,
    time: formatMessageTime(message.createdAt),
    source: message.source || getChannelLabel(channel),
    topic: message.topic,
    company: message.company,
    website: message.website,
    createdAt: message.createdAt
  }
}

function formatMessageTime(value: string) {
  const date = new Date(value)
  const diffMs = Date.now() - date.getTime()
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (!Number.isFinite(date.getTime())) return value
  if (diffMs < minute) return 'just now'
  if (diffMs < hour) return `${Math.floor(diffMs / minute)}m ago`
  if (diffMs < day) return `${Math.floor(diffMs / hour)}h ago`

  return `${Math.floor(diffMs / day)}d ago`
}

function getInboxErrorMessage(error: unknown) {
  if (!error || typeof error !== 'object') {
    return 'Inbox could not be loaded'
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
    return 'Inbox could not be loaded'
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
            channel
            status
            category
            fromName
            fromEmail
            subject
            preview
            body
            topic
            company
            website
            source
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
    const updated = normalizeMessage(result.updateInboxMessageStatus)
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

function markSelectedRead() {
  if (!selectedMessage.value) {
    return
  }

  updateSelectedStatus(selectedMessage.value.status === 'unread' ? 'read' : 'unread')
}

function archiveSelected() {
  updateSelectedStatus('archived')
}

function spamSelected() {
  updateSelectedStatus('spam')
}

function restoreSelected() {
  updateSelectedStatus('read')
}

</script>

<template>
  <UDashboardPanel id="dashboard-inbox">
    <template #header>
      <UDashboardNavbar title="Inbox" icon="i-lucide-mail">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <div class="flex items-center gap-2">
            <DashboardHeaderActions />
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-lucide-refresh-cw"
              :loading="isRefreshing"
              @click="loadMessages"
            >
              Refresh
            </UButton>
            <UButton color="neutral" variant="outline" icon="i-lucide-archive" disabled>
              Archive all read
            </UButton>
          </div>
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
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
        </template>

        <template #right>
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
            <UInput
              v-model="search"
              icon="i-lucide-search"
              placeholder="Search emails..."
              class="sm:w-64"
            />
            <USelect v-model="categoryFilter" :items="categoryOptions" class="sm:w-40" />
          </div>
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <div class="grid gap-4 p-4 lg:grid-cols-[420px_1fr]">
        <UCard :ui="{ body: 'p-0' }">
          <template #header>
            <div class="flex items-center justify-between gap-3">
              <div>
                <h2 class="text-sm font-semibold text-highlighted">Messages</h2>
                <p class="text-xs text-muted">Messages from contact, email, and system channels</p>
              </div>
              <UBadge color="primary" variant="soft">{{ unreadCount }} unread</UBadge>
            </div>
          </template>

          <div v-if="isLoading" class="space-y-3 p-4">
            <USkeleton v-for="item in 5" :key="item" class="h-20 w-full" />
          </div>

          <div v-else-if="filteredMessages.length" class="divide-y divide-default">
            <button
              v-for="message in filteredMessages"
              :key="message.id"
              type="button"
              class="block w-full border-s-2 px-4 py-3 text-start transition hover:bg-muted/40"
              :class="
                selectedMessageId === message.id
                  ? 'border-primary bg-primary/5'
                  : 'border-transparent'
              "
              @click="selectedMessageId = message.id"
            >
              <div class="flex items-start gap-3">
                <span
                  class="mt-2 size-2 rounded-full"
                  :class="message.status === 'unread' ? 'bg-primary' : 'bg-transparent'"
                />
                <div class="min-w-0 flex-1 space-y-1">
                  <div class="flex items-start justify-between gap-3">
                    <p
                      class="truncate text-sm text-highlighted"
                      :class="message.status === 'unread' ? 'font-semibold' : 'font-medium'"
                    >
                      {{ message.fromName }}
                    </p>
                    <span class="shrink-0 text-xs text-muted">{{ message.time }}</span>
                  </div>
                  <p
                    class="truncate text-sm text-highlighted"
                    :class="message.status === 'unread' ? 'font-semibold' : ''"
                  >
                    {{ message.subject }}
                  </p>
                  <p class="line-clamp-2 text-xs leading-5 text-muted">
                    {{ message.preview }}
                  </p>
                  <div class="flex flex-wrap gap-2 pt-1">
                    <UBadge color="neutral" variant="outline" size="sm">
                      {{ getChannelLabel(message.channel) }}
                    </UBadge>
                    <UBadge :color="getCategoryColor(message.category)" variant="soft" size="sm">
                      {{ getCategoryLabel(message.category) }}
                    </UBadge>
                    <UBadge :color="getStatusColor(message.status)" variant="subtle" size="sm">
                      {{ getStatusLabel(message.status) }}
                    </UBadge>
                  </div>
                </div>
              </div>
            </button>
          </div>

          <div v-else class="p-8 text-center">
            <div
              class="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-muted"
            >
              <UIcon name="i-lucide-mail-x" class="size-5 text-muted" />
            </div>
            <h3 class="text-sm font-medium text-highlighted">No messages found</h3>
            <p class="mt-1 text-sm text-muted">Try a different search or filter.</p>
          </div>
        </UCard>

        <UCard v-if="selectedMessage">
          <template #header>
            <div class="flex flex-col gap-4">
              <div class="flex items-start justify-between gap-4">
                <div class="flex min-w-0 items-start gap-3">
                  <UAvatar :alt="selectedMessage.fromName" size="lg" />
                  <div class="min-w-0">
                    <p class="truncate text-sm font-semibold text-highlighted">
                      {{ selectedMessage.fromName }}
                    </p>
                    <p class="truncate text-xs text-muted">{{ selectedMessage.fromEmail }}</p>
                    <h2 class="mt-3 text-lg font-semibold tracking-normal text-highlighted">
                      {{ selectedMessage.subject }}
                    </h2>
                  </div>
                </div>
                <div class="shrink-0 text-end">
                  <p class="text-xs text-muted">{{ selectedMessage.time }}</p>
                  <div class="mt-2 flex flex-wrap justify-end gap-2">
                    <UBadge :color="getCategoryColor(selectedMessage.category)" variant="soft">
                      {{ getCategoryLabel(selectedMessage.category) }}
                    </UBadge>
                    <UBadge :color="getStatusColor(selectedMessage.status)" variant="subtle">
                      {{ getStatusLabel(selectedMessage.status) }}
                    </UBadge>
                  </div>
                </div>
              </div>

              <div class="flex flex-wrap gap-2">
                <UButton
                  color="neutral"
                  variant="outline"
                  icon="i-lucide-mail-check"
                  size="sm"
                  @click="markSelectedRead"
                >
                  {{ selectedMessage.status === 'unread' ? 'Mark read' : 'Mark unread' }}
                </UButton>
                <UButton color="primary" variant="soft" icon="i-lucide-user-plus" size="sm">
                  Create lead
                </UButton>
                <UButton
                  color="neutral"
                  variant="ghost"
                  icon="i-lucide-archive"
                  size="sm"
                  @click="archiveSelected"
                >
                  Archive
                </UButton>
                <UButton
                  color="error"
                  variant="ghost"
                  icon="i-lucide-octagon-alert"
                  size="sm"
                  @click="spamSelected"
                >
                  Spam
                </UButton>
                <UDropdownMenu
                  :items="[
                    [
                      {
                        label: 'Restore',
                        icon: 'i-lucide-rotate-ccw',
                        onSelect: restoreSelected
                      }
                    ]
                  ]"
                >
                  <UButton
                    color="neutral"
                    variant="ghost"
                    icon="i-lucide-more-horizontal"
                    size="sm"
                  />
                </UDropdownMenu>
              </div>
            </div>
          </template>

          <div class="space-y-5">
            <div class="whitespace-pre-line text-sm leading-7 text-highlighted">
              {{ selectedMessage.body }}
            </div>

            <p class="text-xs text-muted">
              Received via {{ selectedMessage.source }} · {{ getChannelLabel(selectedMessage.channel) }}
            </p>

            <div
              v-if="selectedMessage.company || selectedMessage.website"
              class="grid gap-3 text-xs text-muted sm:grid-cols-2"
            >
              <p v-if="selectedMessage.company">
                <span class="font-medium text-highlighted">Company:</span>
                {{ selectedMessage.company }}
              </p>
              <p v-if="selectedMessage.website">
                <span class="font-medium text-highlighted">Website:</span>
                {{ selectedMessage.website }}
              </p>
            </div>

            <UCard
              v-if="['lead', 'job', 'freelance'].includes(selectedMessage.category)"
              variant="subtle"
            >
              <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p class="text-sm font-medium text-highlighted">Lead candidate</p>
                  <p class="text-sm text-muted">This message may become a lead.</p>
                </div>
                <UButton color="primary" variant="soft" icon="i-lucide-user-plus">
                  Create lead
                </UButton>
              </div>
            </UCard>

            <USeparator />

            <div class="space-y-3">
              <div>
                <h3 class="text-sm font-medium text-highlighted">Internal note</h3>
                <p class="text-xs text-muted">Local UI only. Notes are not saved yet.</p>
              </div>
              <UTextarea
                v-model="internalNote"
                placeholder="Add context for future follow-up..."
                :rows="4"
              />
              <UButton color="neutral" variant="outline" disabled>Save note</UButton>
            </div>
          </div>
        </UCard>

        <UCard v-else>
          <div class="flex min-h-[420px] items-center justify-center text-center">
            <div class="max-w-sm">
              <div
                class="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-muted"
              >
                <UIcon name="i-lucide-mail-open" class="size-6 text-muted" />
              </div>
              <h2 class="text-base font-semibold text-highlighted">Select a message</h2>
              <p class="mt-2 text-sm text-muted">Choose a message from the inbox to review it.</p>
            </div>
          </div>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>
