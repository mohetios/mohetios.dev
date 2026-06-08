<script setup lang="ts">
import type { InboxThreadEvent } from '~/utils/inbox-thread'

const props = defineProps<{
  event: InboxThreadEvent
}>()

const { t } = useI18n()

type BubbleKind = 'incoming' | 'outgoing' | 'system' | 'note'

const bubbleKind = computed<BubbleKind>(() => {
  switch (props.event.type) {
    case 'outbound_reply':
      return 'outgoing'
    case 'internal_note':
      return 'note'
    case 'status_change':
      return 'system'
    case 'ai_draft':
      return 'note'
    default:
      return 'incoming'
  }
})

const isOutgoing = computed(() => bubbleKind.value === 'outgoing')
const isSystem = computed(() => bubbleKind.value === 'system')

const displayAuthor = computed(() => {
  if (bubbleKind.value === 'outgoing') {
    return 'Mohetios.dev'
  }

  return props.event.authorName
})

const deliveryLabel = computed(() => {
  if (props.event.deliveryStatus === 'sent') {
    return t('dashboard.inbox.timeline.sent')
  }

  if (props.event.deliveryStatus === 'failed') {
    return t('dashboard.inbox.timeline.failed')
  }

  return null
})
</script>

<template>
  <div v-if="isSystem" class="flex justify-center py-1">
    <p class="max-w-[90%] text-center text-xs text-muted">
      {{ event.bodyText }}
      <span> · {{ event.time }}</span>
    </p>
  </div>

  <div v-else class="flex" :class="isOutgoing ? 'justify-end' : 'justify-start'">
    <article
      class="max-w-[86%] rounded-2xl px-4 py-3 text-sm shadow-sm lg:max-w-[72%]"
      :class="
        isOutgoing
          ? 'rounded-br-md bg-primary/10 text-highlighted'
          : bubbleKind === 'note'
            ? 'rounded-bl-md border border-amber-200/80 bg-amber-50/80 dark:border-amber-900/50 dark:bg-amber-950/30'
            : 'rounded-bl-md bg-muted/50 text-default'
      "
    >
      <header class="mb-2 flex items-center justify-between gap-3 text-xs text-muted">
        <span class="truncate font-medium">
          {{ displayAuthor }}
        </span>

        <div class="flex shrink-0 items-center gap-2">
          <span v-if="deliveryLabel" class="text-success">
            {{ deliveryLabel }}
          </span>
          <time>{{ event.time }}</time>
        </div>
      </header>

      <div class="whitespace-pre-wrap break-words leading-6">
        {{ event.bodyText }}
      </div>
    </article>
  </div>
</template>
