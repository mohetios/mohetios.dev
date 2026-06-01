<script setup lang="ts">
type InboxCategory = 'lead' | 'job' | 'freelance' | 'general' | 'system'
type InboxStatus = 'unread' | 'read' | 'archived' | 'spam'
type BadgeColor = 'primary' | 'info' | 'success' | 'neutral' | 'warning' | 'error'

type InboxMessage = {
  id: string
  fromName: string
  fromEmail: string
  subject: string
  preview: string
  body: string
  category: InboxCategory
  status: InboxStatus
  time: string
  source?: string
}

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
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

const messages = ref<InboxMessage[]>([
  {
    id: 'msg-1',
    fromName: 'Sarah Chen',
    fromEmail: 'sarah@northstar.studio',
    subject: 'Project inquiry for an editorial product',
    preview: 'I found your work through Mohetios and wanted to ask about a small product build.',
    body: 'Hi Mohet,\n\nI found your work through Mohetios and wanted to ask about a small product build for an editorial research team. We need a calm publishing workflow, lightweight review states, and a public archive that can grow without becoming noisy.\n\nCould you share availability for a discovery call next week?',
    category: 'lead',
    status: 'unread',
    time: '1h ago',
    source: 'hi@mohetios.dev'
  },
  {
    id: 'msg-2',
    fromName: 'Jonas Meyer',
    fromEmail: 'jonas@atelier.jobs',
    subject: 'Senior product engineer opportunity',
    preview:
      'We are looking for someone who can bridge product systems and implementation quality.',
    body: 'Hello,\n\nWe are looking for a senior product engineer who can bridge product systems and implementation quality. Your writing around practical systems matched what our team needs.\n\nWould you be open to a conversation?',
    category: 'job',
    status: 'unread',
    time: '3h ago',
    source: 'hi@mohetios.dev'
  },
  {
    id: 'msg-3',
    fromName: 'Mina Studio',
    fromEmail: 'hello@mina.studio',
    subject: 'Collaboration proposal',
    preview: 'We are preparing a technical publication and would like to collaborate.',
    body: 'Hi Mohet,\n\nWe are preparing a technical publication about small web tools and durable product thinking. Your site has the tone we are looking for, and we would like to discuss a collaboration.',
    category: 'freelance',
    status: 'read',
    time: '5h ago',
    source: 'hi@mohetios.dev'
  },
  {
    id: 'msg-4',
    fromName: 'Nadia Rahimi',
    fromEmail: 'nadia@example.com',
    subject: 'Question about pricing',
    preview: 'Do you take short consulting calls for product architecture reviews?',
    body: 'Hi,\n\nDo you take short consulting calls for product architecture reviews? I have a Nuxt and Cloudflare project that needs a second opinion before launch.',
    category: 'lead',
    status: 'unread',
    time: '8h ago',
    source: 'hi@mohetios.dev'
  },
  {
    id: 'msg-5',
    fromName: 'Cloudflare Email Routing',
    fromEmail: 'no-reply@cloudflare.com',
    subject: 'Email Routing test message',
    preview: 'This is a test message for your configured route.',
    body: 'This is a test message confirming that Email Routing can receive mail for this destination. No action is required.',
    category: 'system',
    status: 'read',
    time: '1d ago',
    source: 'hi@mohetios.dev'
  },
  {
    id: 'msg-6',
    fromName: 'Mohetios.dev',
    fromEmail: 'notifications@mohetios.dev',
    subject: 'New comment awaiting review',
    preview: 'A new comment was submitted on the edge caching note.',
    body: 'A new comment was submitted on /writing/edge-caching and is waiting for moderation.\n\nComment preview: Great breakdown of the cache invalidation tradeoffs.',
    category: 'system',
    status: 'read',
    time: '1d ago',
    source: 'notifications@mohetios.dev'
  },
  {
    id: 'msg-7',
    fromName: 'SEO Growth Team',
    fromEmail: 'rankfast@example.net',
    subject: 'Rank #1 on Google guaranteed',
    preview: 'We can deliver thousands of backlinks and instant traffic.',
    body: 'Hello website owner,\n\nWe can deliver thousands of backlinks and instant traffic for your domain. Reply now for a special discount.',
    category: 'general',
    status: 'spam',
    time: '2d ago',
    source: 'hi@mohetios.dev'
  },
  {
    id: 'msg-8',
    fromName: 'System Digest',
    fromEmail: 'digest@mohetios.dev',
    subject: 'Weekly dashboard digest',
    preview: 'A quiet summary of traffic, notes, and message activity.',
    body: 'Weekly digest\n\n- 24 new leads\n- 8 unread emails\n- 5 pending comments\n- 31 form submissions\n\nThis is mock data for the dashboard prototype.',
    category: 'system',
    status: 'archived',
    time: '3d ago',
    source: 'digest@mohetios.dev'
  }
])

const selectedMessageId = ref(messages.value[0]?.id)
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

watch(filteredMessages, (currentMessages) => {
  if (currentMessages.some((message) => message.id === selectedMessageId.value)) {
    return
  }

  selectedMessageId.value = currentMessages[0]?.id
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

function updateSelectedStatus(status: InboxStatus) {
  const message = messages.value.find((item) => item.id === selectedMessageId.value)

  if (message) {
    message.status = status
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
            <UButton color="neutral" variant="ghost" icon="i-lucide-refresh-cw"> Refresh </UButton>
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
                <p class="text-xs text-muted">Mock mailbox for dashboard review</p>
              </div>
              <UBadge color="primary" variant="soft">{{ unreadCount }} unread</UBadge>
            </div>
          </template>

          <div v-if="filteredMessages.length" class="divide-y divide-default">
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
              Received via {{ selectedMessage.source || 'hi@mohetios.dev' }}
            </p>

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
