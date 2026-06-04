<script setup lang="ts">
import type { InboxThreadEvent } from '~/utils/inbox-thread'

const props = defineProps<{
  event: InboxThreadEvent
}>()

const eventUi = computed(() => {
  switch (props.event.type) {
    case 'internal_note':
      return {
        root: 'rounded-xl border border-amber-200/80 bg-amber-50/80 p-4 dark:border-amber-900/50 dark:bg-amber-950/30',
        badge: { label: 'Private', color: 'warning' as const }
      }
    case 'ai_draft':
      return {
        root: 'rounded-xl border border-violet-200/80 bg-violet-50/80 p-4 dark:border-violet-900/50 dark:bg-violet-950/30',
        badge: { label: 'Draft', color: 'primary' as const }
      }
    case 'outbound_reply':
      return {
        root: 'rounded-xl border border-primary/30 bg-primary/5 p-4',
        badge: props.event.deliveryStatus === 'sent'
          ? { label: 'Sent', color: 'success' as const }
          : undefined
      }
    case 'status_change':
      return {
        root: 'rounded-lg px-1 py-1 text-xs text-muted',
        badge: undefined
      }
    default:
      return {
        root: 'rounded-xl border border-default bg-default p-4 shadow-sm',
        badge: undefined
      }
  }
})
</script>

<template>
  <div v-if="event.type === 'status_change'" :class="eventUi.root">
    <p>{{ event.bodyText }}</p>
    <span class="text-muted"> · {{ event.time }}</span>
  </div>

  <article v-else :class="eventUi.root">
    <div class="flex flex-wrap items-start justify-between gap-2">
      <div class="min-w-0">
        <p class="text-sm font-medium text-highlighted">
          {{ event.authorName }}
        </p>
        <p v-if="event.authorEmail" class="text-xs text-muted">
          {{ event.authorEmail }}
        </p>
      </div>

      <div class="flex shrink-0 items-center gap-2">
        <UBadge
          v-if="eventUi.badge"
          :color="eventUi.badge.color"
          variant="soft"
          size="sm"
          class="rounded-full"
        >
          {{ eventUi.badge.label }}
        </UBadge>
        <span class="text-xs text-muted">{{ event.time }}</span>
      </div>
    </div>

    <p class="mt-3 whitespace-pre-line text-sm leading-7 text-highlighted">
      {{ event.bodyText }}
    </p>
  </article>
</template>
