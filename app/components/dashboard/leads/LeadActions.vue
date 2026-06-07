<script setup lang="ts">
import type { LeadStatus } from '~/composables/useLeadsWorkspace'

defineProps<{
  disabled?: boolean
}>()

const emit = defineEmits<{
  'open-conversation': []
  'update-status': [status: LeadStatus]
}>()

const { t } = useI18n()

const dropdownItems = computed(() => [
  [
    {
      label: t('dashboard.leads.actions.markWon'),
      onSelect: () => emit('update-status', 'WON')
    },
    {
      label: t('dashboard.leads.actions.markLost'),
      onSelect: () => emit('update-status', 'LOST')
    },
    {
      label: t('dashboard.leads.actions.archive'),
      onSelect: () => emit('update-status', 'ARCHIVED')
    }
  ]
])
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <UButton
      color="primary"
      size="sm"
      icon="i-lucide-message-square"
      :disabled="disabled"
      @click="emit('open-conversation')"
    >
      {{ t('dashboard.leads.actions.openConversation') }}
    </UButton>

    <UButton
      color="neutral"
      variant="soft"
      size="sm"
      :disabled="disabled"
      @click="emit('update-status', 'QUALIFIED')"
    >
      {{ t('dashboard.leads.actions.markQualified') }}
    </UButton>

    <UButton
      color="neutral"
      variant="soft"
      size="sm"
      :disabled="disabled"
      @click="emit('update-status', 'FOLLOW_UP')"
    >
      {{ t('dashboard.leads.actions.moveToFollowUp') }}
    </UButton>

    <UDropdownMenu :items="dropdownItems">
      <UButton
        color="neutral"
        variant="ghost"
        size="sm"
        icon="i-lucide-ellipsis"
        :disabled="disabled"
        :aria-label="t('dashboard.inbox.workspace.moreActions')"
      />
    </UDropdownMenu>
  </div>
</template>
