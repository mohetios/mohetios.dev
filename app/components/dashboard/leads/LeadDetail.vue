<script setup lang="ts">
import type { LeadPriority, LeadStatus } from '~/composables/useLeadsWorkspace'
import type { Lead } from '~/utils/lead-normalize'
import {
  formatLeadDate,
  getLeadPriorityLabel,
  getLeadSourceLabel,
  getLeadStatusColor,
  getLeadStatusLabel
} from '~/utils/lead-normalize'

const props = defineProps<{
  lead: Lead | null
  loading?: boolean
  mobile?: boolean
  mutating?: boolean
}>()

const emit = defineEmits<{
  close: []
  'open-conversation': []
  'update-status': [status: LeadStatus]
  'update-priority': [priority: LeadPriority]
  'update-follow-up': [value: string | null]
  'update-notes': [value: string | null]
}>()

const { t, locale } = useI18n()

const notesDraft = ref('')
const followUpDraft = ref('')

watch(
  () => props.lead,
  (lead) => {
    notesDraft.value = lead?.notes || ''
    followUpDraft.value = lead?.nextFollowUpAt
      ? new Date(lead.nextFollowUpAt).toISOString().slice(0, 16)
      : ''
  },
  { immediate: true }
)

const statusOptions = computed(() =>
  (['NEW', 'QUALIFIED', 'FOLLOW_UP', 'WON', 'LOST', 'ARCHIVED'] as LeadStatus[]).map((value) => ({
    label: getLeadStatusLabel(value, t),
    value
  }))
)

const priorityOptions = computed(() =>
  (['LOW', 'MEDIUM', 'HIGH'] as LeadPriority[]).map((value) => ({
    label: getLeadPriorityLabel(value, t),
    value
  }))
)

const statusValue = computed({
  get: () => props.lead?.status ?? 'NEW',
  set: (value: LeadStatus) => emit('update-status', value)
})

const priorityValue = computed({
  get: () => props.lead?.priority ?? 'MEDIUM',
  set: (value: LeadPriority) => emit('update-priority', value)
})

function saveNotes() {
  if (!props.lead) return
  emit('update-notes', notesDraft.value.trim() || null)
}
</script>

<template>
  <section
    class="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-default bg-default"
    :class="
      mobile
        ? 'h-full rounded-none border-0'
        : 'hidden min-h-[calc(100vh-var(--dashboard-header-height,4rem)-2rem)] lg:flex'
    "
  >
    <div v-if="loading" class="space-y-4 p-4">
      <USkeleton class="h-6 w-2/3" />
      <USkeleton class="h-4 w-1/2" />
      <USkeleton class="mt-6 h-24 w-full" />
      <USkeleton class="h-24 w-full" />
    </div>

    <DashboardWorkspaceEmptyState
      v-else-if="!lead"
      icon="i-lucide-user-search"
      :title="t('dashboard.leads.select.title')"
      :description="t('dashboard.leads.select.description')"
      class="py-16"
    />

    <template v-else>
      <div class="flex items-start justify-between gap-3 border-b border-default px-4 py-3">
        <div class="min-w-0">
          <h2 class="truncate text-base font-semibold text-highlighted">
            {{ lead.name || lead.email }}
          </h2>
          <p class="mt-0.5 truncate text-sm text-muted">
            {{ lead.subject || t('dashboard.leads.untitled') }}
          </p>
          <div class="mt-2 flex flex-wrap gap-1.5">
            <UBadge size="xs" variant="soft">
              {{ getLeadSourceLabel(lead.source, t) }}
            </UBadge>
            <UBadge size="xs" :color="getLeadStatusColor(lead.status)" variant="soft">
              {{ getLeadStatusLabel(lead.status, t) }}
            </UBadge>
            <UBadge v-if="lead.priority === 'HIGH'" size="xs" color="warning" variant="soft">
              {{ getLeadPriorityLabel(lead.priority, t) }}
            </UBadge>
            <UBadge v-if="lead.isFollowUpOverdue" size="xs" color="warning" variant="soft">
              {{ t('dashboard.leads.overdue') }}
            </UBadge>
          </div>
        </div>

        <UButton
          v-if="mobile"
          color="neutral"
          variant="ghost"
          size="sm"
          icon="i-lucide-x"
          :aria-label="t('dashboard.inbox.workspace.close')"
          @click="emit('close')"
        />
      </div>

      <div class="min-h-0 flex-1 space-y-5 overflow-y-auto p-4">
        <DashboardLeadsLeadActions
          :disabled="mutating"
          @open-conversation="emit('open-conversation')"
          @update-status="emit('update-status', $event)"
        />

        <section class="space-y-3">
          <h3 class="text-sm font-medium text-highlighted">
            {{ t('dashboard.leads.detail.info') }}
          </h3>
          <dl class="grid gap-2 text-sm">
            <div class="flex justify-between gap-3">
              <dt class="text-muted">{{ t('dashboard.leads.fields.email') }}</dt>
              <dd class="truncate text-end text-default">{{ lead.email }}</dd>
            </div>
            <div class="flex justify-between gap-3">
              <dt class="text-muted">{{ t('dashboard.leads.fields.source') }}</dt>
              <dd class="text-default">{{ getLeadSourceLabel(lead.source, t) }}</dd>
            </div>
            <div class="flex justify-between gap-3">
              <dt class="text-muted">{{ t('dashboard.leads.fields.created') }}</dt>
              <dd class="text-default">{{ formatLeadDate(lead.createdAt, locale) }}</dd>
            </div>
            <div class="flex justify-between gap-3">
              <dt class="text-muted">{{ t('dashboard.leads.detail.latestActivity') }}</dt>
              <dd class="text-default">{{ formatLeadDate(lead.lastActivityAt, locale) }}</dd>
            </div>
            <div v-if="lead.nextFollowUpAt" class="flex justify-between gap-3">
              <dt class="text-muted">{{ t('dashboard.leads.detail.nextFollowUp') }}</dt>
              <dd class="text-default">{{ formatLeadDate(lead.nextFollowUpAt, locale) }}</dd>
            </div>
          </dl>
        </section>

        <section class="space-y-3">
          <h3 class="text-sm font-medium text-highlighted">
            {{ t('dashboard.leads.detail.qualification') }}
          </h3>

          <div class="space-y-3">
            <div>
              <label class="mb-1 block text-xs text-muted">{{
                t('dashboard.leads.fields.status')
              }}</label>
              <USelect
                v-model="statusValue"
                :items="statusOptions"
                value-key="value"
                label-key="label"
                size="sm"
                :disabled="mutating"
                class="w-full"
              />
            </div>

            <div>
              <label class="mb-1 block text-xs text-muted">{{
                t('dashboard.leads.fields.priority')
              }}</label>
              <USelect
                v-model="priorityValue"
                :items="priorityOptions"
                value-key="value"
                label-key="label"
                size="sm"
                :disabled="mutating"
                class="w-full"
              />
            </div>

            <div>
              <label class="mb-1 block text-xs text-muted">{{
                t('dashboard.leads.actions.setFollowUp')
              }}</label>
              <DashboardLeadsLeadFollowUpPicker
                v-model="followUpDraft"
                :disabled="mutating"
                @save="emit('update-follow-up', $event)"
                @clear="emit('update-follow-up', null)"
              />
            </div>

            <div>
              <label class="mb-1 block text-xs text-muted">{{
                t('dashboard.leads.fields.notes')
              }}</label>
              <UTextarea
                v-model="notesDraft"
                :rows="4"
                :disabled="mutating"
                :placeholder="t('dashboard.leads.detail.noNotes')"
                @blur="saveNotes"
              />
            </div>
          </div>
        </section>

        <section class="space-y-3">
          <h3 class="text-sm font-medium text-highlighted">
            {{ t('dashboard.leads.detail.conversationPreview') }}
          </h3>
          <p class="rounded-lg border border-default bg-muted/20 p-3 text-sm text-default">
            {{ lead.summary }}
          </p>
          <UButton
            color="neutral"
            variant="soft"
            size="sm"
            icon="i-lucide-external-link"
            :disabled="mutating"
            @click="emit('open-conversation')"
          >
            {{ t('dashboard.leads.actions.openConversation') }}
          </UButton>
        </section>
      </div>
    </template>
  </section>
</template>
