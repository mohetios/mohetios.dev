<script setup lang="ts">
import type { InboxMessage } from '~/utils/inbox-thread'
import {
  getCategoryColor,
  getCategoryLabel,
  getSourceLabel,
  getStatusColor,
  getThreadStatus,
  getThreadStatusLabel
} from '~/utils/inbox-thread'

const props = defineProps<{
  message: InboxMessage
  selected: boolean
}>()

const emit = defineEmits<{
  select: []
}>()

const isUnread = computed(() => ['new', 'open'].includes(props.message.status))

const showStatusBadge = computed(() => {
  const status = getThreadStatus(props.message)
  return status === 'needs_reply' || status === 'spam'
})

const showLeadBadge = computed(() => props.message.kind === 'lead')
</script>

<template>
  <button
    type="button"
    class="group w-full px-3 py-3 text-start transition hover:bg-muted/40 lg:py-3.5"
    :class="[
      selected
        ? 'border-s-2 border-primary bg-primary/5 lg:border-s-2'
        : 'border-s-2 border-transparent',
      isUnread ? 'bg-default' : ''
    ]"
    :aria-selected="selected"
    @click="emit('select')"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2">
          <p
            class="truncate text-sm text-highlighted"
            :class="isUnread ? 'font-semibold' : 'font-medium'"
          >
            {{ message.senderName || message.senderEmail }}
          </p>

          <UBadge color="neutral" variant="soft" size="xs" class="shrink-0">
            {{ getSourceLabel(message.source) }}
          </UBadge>

          <UBadge
            v-if="showLeadBadge"
            :color="getCategoryColor(message.kind)"
            variant="soft"
            size="xs"
            class="shrink-0"
          >
            {{ getCategoryLabel(message.kind) }}
          </UBadge>

          <UBadge
            v-else-if="showStatusBadge"
            :color="getStatusColor(getThreadStatus(message))"
            variant="subtle"
            size="xs"
            class="shrink-0"
          >
            {{ getThreadStatusLabel(getThreadStatus(message)) }}
          </UBadge>
        </div>

        <p
          class="mt-0.5 truncate text-sm"
          :class="isUnread ? 'font-medium text-default' : 'text-default'"
        >
          {{ message.subject }}
        </p>

        <p class="mt-1 line-clamp-1 text-xs text-muted">
          {{ message.preview }}
        </p>
      </div>

      <time class="shrink-0 text-xs text-muted">
        {{ message.time }}
      </time>
    </div>
  </button>
</template>
