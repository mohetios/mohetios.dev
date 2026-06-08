<script setup lang="ts">
import type { InboxTabItem, InboxTabKey } from '~/utils/inbox-tabs'
import type { InboxMessage } from '~/utils/inbox-thread'

defineProps<{
  primaryTabs: InboxTabItem[]
  secondaryTabs: InboxTabItem[]
  activeTab: InboxTabKey
  messages: InboxMessage[]
  search: string
  loading: boolean
  selectedMessageId?: string
}>()

const emit = defineEmits<{
  'update:search': [value: string]
  'select-tab': [tab: InboxTabKey]
  'select-message': [id: string]
}>()

const { t } = useI18n()
</script>

<template>
  <section
    class="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-default bg-default lg:min-h-[calc(100vh-var(--dashboard-header-height,4rem)-2rem)]"
  >
    <DashboardInboxTabs
      :primary-tabs="primaryTabs"
      :secondary-tabs="secondaryTabs"
      :active-tab="activeTab"
      @select-tab="emit('select-tab', $event)"
    />

    <div class="border-b border-default px-3 py-2">
      <UInput
        :model-value="search"
        icon="i-lucide-search"
        :placeholder="t('dashboard.inbox.threads.searchConversations')"
        size="sm"
        class="w-full"
        @update:model-value="emit('update:search', $event)"
      />
    </div>

    <div class="min-h-0 flex-1 overflow-y-auto">
      <div v-if="loading" class="divide-y divide-default">
        <div v-for="index in 6" :key="index" class="px-3 py-4">
          <div class="flex items-start gap-3">
            <USkeleton class="h-4 w-24" />
            <USkeleton class="ms-auto h-3 w-10" />
          </div>
          <USkeleton class="mt-2 h-4 w-full" />
          <USkeleton class="mt-2 h-3 w-4/5" />
        </div>
      </div>

      <DashboardWorkspaceEmpty
        v-else-if="!messages.length"
        icon="i-lucide-inbox"
        :title="t('dashboard.inbox.threads.emptyTitle')"
        :description="t('dashboard.inbox.threads.emptyDescription')"
        class="py-12"
      />

      <div v-else class="divide-y divide-default">
        <DashboardInboxRow
          v-for="message in messages"
          :key="message.id"
          :message="message"
          :selected="selectedMessageId === message.id"
          @select="emit('select-message', message.id)"
        />
      </div>
    </div>
  </section>
</template>
