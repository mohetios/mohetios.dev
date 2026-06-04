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
    class="block w-full border-s-2 px-3 py-2.5 text-start transition hover:bg-muted/40"
    :class="selected ? 'border-primary bg-primary/5' : 'border-transparent'"
    :aria-selected="selected"
    @click="emit('select')"
  >
    <div class="flex items-start gap-3">
      <div class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/60">
        <UIcon :name="getSourceIcon(message.source)" class="size-4 text-muted" />
      </div>

      <div class="min-w-0 flex-1">
        <div class="flex items-start justify-between gap-2">
          <p
            class="truncate text-sm text-highlighted"
            :class="
              ['new', 'open'].includes(message.status) ? 'font-semibold' : 'font-medium'
            "
          >
            {{ message.subject }}
          </p>
          <span class="shrink-0 text-[11px] text-muted">{{ message.time }}</span>
        </div>

        <p class="mt-0.5 truncate text-xs text-muted">
          {{ message.senderName }} · {{ getSourceLabel(message.source) }}
        </p>

        <p class="mt-1 line-clamp-2 text-xs leading-5 text-muted">
          {{ message.preview }}
        </p>

        <div class="mt-2 flex flex-wrap gap-1.5">
          <UBadge color="neutral" variant="outline" size="xs">
            {{ getSourceLabel(message.source) }}
          </UBadge>
          <UBadge :color="getCategoryColor(message.kind)" variant="soft" size="xs">
            {{ getCategoryLabel(message.kind) }}
          </UBadge>
          <UBadge
            :color="getStatusColor(getThreadStatus(message))"
            variant="subtle"
            size="xs"
          >
            {{ getThreadStatusLabel(getThreadStatus(message)) }}
          </UBadge>
        </div>
      </div>
    </div>
  </button>
</template>
