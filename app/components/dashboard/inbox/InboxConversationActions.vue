<script setup lang="ts">
const props = defineProps<{
  canMarkRead: boolean
  isTrashed: boolean
}>()

const emit = defineEmits<{
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

const normalMenuItems = computed(() => [
  [
    {
      label: t('dashboard.inbox.workspace.markRead'),
      icon: 'i-lucide-mail-open',
      disabled: !props.canMarkRead,
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
])

const trashedMenuItems = computed(() => [
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
])
</script>

<template>
  <div class="flex shrink-0 items-center gap-1.5">
    <UButton
      v-if="!isTrashed"
      color="primary"
      variant="soft"
      icon="i-lucide-reply"
      size="xs"
      @click="emit('reply')"
    >
      <span class="hidden sm:inline">{{ t('dashboard.inbox.workspace.reply') }}</span>
    </UButton>

    <UDropdownMenu :items="isTrashed ? trashedMenuItems : normalMenuItems">
      <UButton
        color="neutral"
        variant="ghost"
        icon="i-lucide-ellipsis"
        size="xs"
        :aria-label="t('dashboard.inbox.workspace.moreActions')"
      />
    </UDropdownMenu>
  </div>
</template>
