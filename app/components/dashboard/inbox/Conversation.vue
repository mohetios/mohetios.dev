<script setup lang="ts">
import type { InboxMessage, InboxThreadEvent } from '~/utils/inbox-thread'

const props = defineProps<{
  message: InboxMessage | null
  events: InboxThreadEvent[]
  replyBody: string
  composerMode: 'reply' | 'note'
  isSendingReply: boolean
  loading?: boolean
  mobile?: boolean
}>()

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

const replyBodyModel = computed({
  get: () => props.replyBody,
  set: (value: string) => emit('update:replyBody', value)
})

const composerModeModel = computed({
  get: () => props.composerMode,
  set: (value: 'reply' | 'note') => emit('update:composerMode', value)
})

const canMarkRead = computed(() => props.message?.status === 'new')
const isTrashed = computed(() => Boolean(props.message?.trashedAt))

function focusComposer() {
  composerModeModel.value = 'reply'
}
</script>

<template>
  <section
    class="flex min-h-0 flex-col overflow-hidden rounded-xl border border-default bg-default"
    :class="
      mobile
        ? 'h-full rounded-none border-0'
        : 'hidden min-h-[calc(100vh-var(--dashboard-header-height,4rem)-2rem)] lg:flex'
    "
  >
    <DashboardWorkspaceEmpty
      v-if="!message && !loading"
      icon="i-lucide-messages-square"
      :title="t('dashboard.inbox.workspace.selectTitle')"
      :description="t('dashboard.inbox.workspace.selectDescription')"
      class="m-auto py-16"
    />

    <template v-else-if="message">
      <DashboardInboxConversationHeader
        :message="message"
        :can-mark-read="canMarkRead"
        :is-trashed="isTrashed"
        :mobile="mobile"
        @close="emit('close')"
        @reply="focusComposer"
        @mark-read="emit('mark-read')"
        @mark-done="emit('mark-done')"
        @archive="emit('archive')"
        @spam="emit('spam')"
        @convert-to-lead="emit('convert-to-lead')"
        @move-to-trash="emit('move-to-trash')"
        @restore="emit('restore')"
        @delete-forever="emit('delete-forever')"
      />

      <DashboardInboxMeta :message="message" />

      <div class="min-h-0 flex-1 overflow-y-auto px-4 py-4 pb-28">
        <div v-if="loading" class="space-y-4">
          <USkeleton class="h-24 w-3/4 rounded-2xl" />
          <USkeleton class="ms-auto h-20 w-2/3 rounded-2xl" />
          <USkeleton class="h-24 w-3/4 rounded-2xl" />
        </div>

        <div v-else class="space-y-4">
          <DashboardInboxBubble v-for="event in events" :key="event.id" :event="event" />
        </div>
      </div>

      <footer
        v-if="!isTrashed"
        class="sticky bottom-0 shrink-0 border-t border-default bg-default/95 p-3 backdrop-blur"
      >
        <DashboardInboxComposer
          v-model:composer-mode="composerModeModel"
          v-model:reply-body="replyBodyModel"
          :is-sending-reply="isSendingReply"
          compact
          disable-notes
          @send-reply="emit('send-reply')"
        />
      </footer>
    </template>
  </section>
</template>
