<script setup lang="ts">
import type { ContextMenuItem } from '@nuxt/ui'

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

const isUnread = computed(() => ['new', 'open'].includes(props.message.status))
const canMarkRead = computed(() => props.message.status === 'new')
const isTrashed = computed(() => Boolean(props.message.trashedAt))

const showStatusBadge = computed(() => {
  const status = getThreadStatus(props.message)
  return status === 'needs_reply' || status === 'spam'
})

const showLeadBadge = computed(() => props.message.kind === 'lead')

const menuItems = computed<ContextMenuItem[][]>(() => {
  if (isTrashed.value) {
    return [
      [
        {
          label: t('dashboard.inbox.workspace.restore'),
          icon: 'i-lucide-rotate-ccw',
          onSelect: () => emit('restore')
        },
        {
          label: t('dashboard.inbox.workspace.deleteForever'),
          icon: 'i-lucide-trash',
          color: 'error' as const,
          onSelect: () => emit('delete-forever')
        }
      ]
    ]
  }

  return [
    [
      {
        label: t('dashboard.inbox.workspace.reply'),
        icon: 'i-lucide-reply',
        onSelect: () => emit('reply')
      }
    ],
    [
      {
        label: t('dashboard.inbox.workspace.markRead'),
        icon: 'i-lucide-mail-open',
        disabled: !canMarkRead.value,
        onSelect: () => emit('mark-read')
      },
      {
        label: t('dashboard.inbox.workspace.markDone'),
        icon: 'i-lucide-check',
        onSelect: () => emit('mark-done')
      },
      {
        label: t('dashboard.inbox.workspace.convertToLead'),
        icon: 'i-lucide-user-plus',
        onSelect: () => emit('convert-to-lead')
      }
    ],
    [
      {
        label: t('dashboard.inbox.workspace.archive'),
        icon: 'i-lucide-archive',
        onSelect: () => emit('archive')
      },
      {
        label: t('dashboard.inbox.workspace.spam'),
        icon: 'i-lucide-octagon-alert',
        color: 'error' as const,
        onSelect: () => emit('spam')
      },
      {
        label: t('dashboard.inbox.workspace.moveToTrash'),
        icon: 'i-lucide-trash-2',
        onSelect: () => emit('move-to-trash')
      }
    ]
  ]
})
</script>

<template>
  <UContextMenu
    :items="menuItems"
    :press-open-delay="550"
    :ui="{ content: 'w-52' }"
    @update:open="(open) => open && emit('select')"
  >
    <button
      type="button"
      class="group w-full touch-manipulation px-3 py-3 text-start transition hover:bg-muted/40 lg:py-3.5"
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
  </UContextMenu>
</template>
