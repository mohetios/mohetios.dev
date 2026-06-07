<script setup lang="ts">
import type { LeadPriority, LeadStatus } from '~/composables/useLeadsWorkspace'
import type { Lead } from '~/utils/lead-normalize'

defineProps<{
  lead: Lead | null
  loading?: boolean
  mutating?: boolean
}>()

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  close: []
  'open-conversation': []
  'update-status': [status: LeadStatus]
  'update-priority': [priority: LeadPriority]
  'update-follow-up': [value: string | null]
  'update-notes': [value: string | null]
}>()

const { t } = useI18n()
</script>

<template>
  <UDrawer
    v-model:open="open"
    direction="bottom"
    :title="lead?.subject || t('dashboard.leads.title')"
    :description="lead ? `${lead.name || lead.email}` : undefined"
    :ui="{
      content: 'h-[92dvh] rounded-t-2xl p-0'
    }"
  >
    <template #content>
      <DashboardLeadsLeadDetail
        v-if="lead"
        :lead="lead"
        :loading="loading"
        :mutating="mutating"
        mobile
        @close="emit('close')"
        @open-conversation="emit('open-conversation')"
        @update-status="emit('update-status', $event)"
        @update-priority="emit('update-priority', $event)"
        @update-follow-up="emit('update-follow-up', $event)"
        @update-notes="emit('update-notes', $event)"
      />
    </template>
  </UDrawer>
</template>
