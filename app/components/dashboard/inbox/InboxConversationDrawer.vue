<script setup lang="ts">
import type { InboxMessage, InboxThreadEvent } from '~/utils/inbox-thread'

defineProps<{
  message: InboxMessage | null
  events: InboxThreadEvent[]
  replyBody: string
  composerMode: 'reply' | 'note'
  isSendingReply: boolean
  loading?: boolean
}>()

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  close: []
  'send-reply': []
  'update:replyBody': [value: string]
  'update:composerMode': [value: 'reply' | 'note']
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
  <UDrawer
    v-model:open="open"
    direction="bottom"
    :title="message?.subject || t('dashboard.inbox.title')"
    :description="message ? `${message.senderName} · ${message.senderEmail}` : undefined"
    :ui="{
      content: 'h-[92dvh] rounded-t-2xl p-0'
    }"
  >
    <template #content>
      <DashboardInboxConversation
        v-if="message"
        :message="message"
        :events="events"
        :reply-body="replyBody"
        :composer-mode="composerMode"
        :is-sending-reply="isSendingReply"
        :loading="loading"
        mobile
        @close="emit('close')"
        @send-reply="emit('send-reply')"
        @update:reply-body="emit('update:replyBody', $event)"
        @update:composer-mode="emit('update:composerMode', $event)"
        @mark-read="emit('mark-read')"
        @mark-done="emit('mark-done')"
        @archive="emit('archive')"
        @spam="emit('spam')"
        @convert-to-lead="emit('convert-to-lead')"
        @move-to-trash="emit('move-to-trash')"
        @restore="emit('restore')"
        @delete-forever="emit('delete-forever')"
      />
    </template>
  </UDrawer>
</template>
