<script setup lang="ts">
import type { InboxMessage } from '~/utils/inbox-thread'
import {
  getCategoryColor,
  getCategoryLabel,
  getSourceIcon,
  getSourceLabel,
  getStatusColor,
  getThreadStatus,
  getThreadStatusLabel
} from '~/utils/inbox-thread'

defineProps<{
  message: InboxMessage
  selected: boolean
}>()

const emit = defineEmits<{
  select: []
}>()
</script>

<template>
  <button
    type="button"
    class="block w-full border-s-2 px-4 py-3 text-start transition hover:bg-muted/40"
    @click="emit('select')"
    :class="selected ? 'border-primary bg-primary/5' : 'border-transparent'"
  >
    <div class="flex items-start gap-3">
      <div
        class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted/60"
      >
        <UIcon :name="getSourceIcon(message.source)" class="size-4 text-muted" />
      </div>

      <div class="min-w-0 flex-1 space-y-1">
        <div class="flex items-start justify-between gap-3">
          <p
            class="truncate text-sm text-highlighted"
            :class="
              ['new', 'open'].includes(message.status) ? 'font-semibold' : 'font-medium'
            "
          >
            {{ message.subject }}
          </p>
          <span class="shrink-0 text-xs text-muted">{{ message.time }}</span>
        </div>

        <p class="truncate text-xs text-muted">
          {{ message.senderName }} · {{ getSourceLabel(message.source) }}
        </p>

        <p class="line-clamp-2 text-xs leading-5 text-muted">
          {{ message.preview }}
        </p>

        <div class="flex flex-wrap gap-2 pt-1">
          <UBadge color="neutral" variant="outline" size="sm">
            {{ getSourceLabel(message.source) }}
          </UBadge>
          <UBadge :color="getCategoryColor(message.kind)" variant="soft" size="sm">
            {{ getCategoryLabel(message.kind) }}
          </UBadge>
          <UBadge
            :color="getStatusColor(getThreadStatus(message))"
            variant="subtle"
            size="sm"
          >
            {{ getThreadStatusLabel(getThreadStatus(message)) }}
          </UBadge>
        </div>
      </div>
    </div>
  </button>
</template>
