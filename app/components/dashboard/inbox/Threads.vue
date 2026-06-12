<script setup lang="ts">
import type { InboxTabItem, InboxTabKey } from '~/utils/inbox-tabs'
import type { InboxMessage } from '~/utils/inbox-thread'

defineProps<{
  primaryTabs: InboxTabItem[]
  secondaryTabs: InboxTabItem[]
  activeTab: InboxTabKey
  unreadOnly: boolean
  unreadCount?: number
  messages: InboxMessage[]
  search: string
  loading: boolean
  selectedMessageId?: string
}>()

const emit = defineEmits<{
  'update:search': [value: string]
  'select-tab': [tab: InboxTabKey]
  'update:unread-only': [value: boolean]
  'select-message': [id: string]
  'reply-message': [id: string]
  'mark-message-read': [id: string]
  'mark-message-done': [id: string]
  'archive-message': [id: string]
  'spam-message': [id: string]
  'convert-message-to-lead': [id: string]
  'move-message-to-trash': [id: string]
  'restore-message': [id: string]
  'delete-message-forever': [id: string]
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
      :unread-only="unreadOnly"
      :unread-count="unreadCount"
      @select-tab="emit('select-tab', $event)"
      @update:unread-only="emit('update:unread-only', $event)"
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
          @reply="emit('reply-message', message.id)"
          @mark-read="emit('mark-message-read', message.id)"
          @mark-done="emit('mark-message-done', message.id)"
          @archive="emit('archive-message', message.id)"
          @spam="emit('spam-message', message.id)"
          @convert-to-lead="emit('convert-message-to-lead', message.id)"
          @move-to-trash="emit('move-message-to-trash', message.id)"
          @restore="emit('restore-message', message.id)"
          @delete-forever="emit('delete-message-forever', message.id)"
        />
      </div>
    </div>
  </section>
</template>
