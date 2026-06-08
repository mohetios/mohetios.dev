<script setup lang="ts">
import type { InboxMessage } from '~/utils/inbox-thread'
import {
  getCategoryColor,
  getCategoryLabel,
  getSourceLabel,
  getStatusColor,
  getStatusLabel
} from '~/utils/inbox-thread'

defineProps<{
  message: InboxMessage
  canMarkRead: boolean
  isTrashed: boolean
  mobile?: boolean
}>()

const emit = defineEmits<{
  close: []
  reply: []
  'mark-read': []
  'mark-done': []
  archive: []
  spam: []
  'convert-to-lead': []
  'move-to-trash': []
  restore: []
  'delete-forever': []
}>()

const { t } = useI18n()
</script>

<template>
  <header
    class="sticky top-0 z-10 shrink-0 border-b border-default bg-default/95 px-4 py-3 backdrop-blur"
  >
    <div class="flex items-start gap-2">
      <UButton
        v-if="mobile"
        color="neutral"
        variant="ghost"
        icon="i-lucide-arrow-left"
        size="sm"
        class="shrink-0"
        :aria-label="t('dashboard.inbox.workspace.close')"
        @click="emit('close')"
      />

      <div class="min-w-0 flex-1">
        <h2 class="truncate text-base font-semibold tracking-tight text-highlighted">
          {{ message.subject }}
        </h2>

        <p class="mt-0.5 truncate text-sm text-muted">
          {{ message.senderName }} · {{ message.senderEmail }}
        </p>

        <div class="mt-2 flex flex-wrap gap-1.5">
          <UBadge color="neutral" variant="soft" size="xs">
            {{ getSourceLabel(message.source) }}
          </UBadge>

          <UBadge :color="getStatusColor(message.status)" variant="subtle" size="xs">
            {{ getStatusLabel(message.status) }}
          </UBadge>

          <UBadge
            v-if="message.kind === 'lead'"
            :color="getCategoryColor(message.kind)"
            variant="soft"
            size="xs"
          >
            {{ getCategoryLabel(message.kind) }}
          </UBadge>
        </div>
      </div>

      <DashboardInboxConversationActions
        :can-mark-read="canMarkRead"
        :is-trashed="isTrashed"
        @reply="emit('reply')"
        @mark-read="emit('mark-read')"
        @mark-done="emit('mark-done')"
        @archive="emit('archive')"
        @spam="emit('spam')"
        @convert-to-lead="emit('convert-to-lead')"
        @move-to-trash="emit('move-to-trash')"
        @restore="emit('restore')"
        @delete-forever="emit('delete-forever')"
      />
    </div>
  </header>
</template>
