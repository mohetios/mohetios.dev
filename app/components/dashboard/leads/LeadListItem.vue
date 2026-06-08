<script setup lang="ts">
import type { Lead } from '~/utils/lead-normalize'
import {
  formatLeadDate,
  getLeadPriorityLabel,
  getLeadSourceLabel,
  getLeadStatusColor,
  getLeadStatusLabel
} from '~/utils/lead-normalize'

defineProps<{
  lead: Lead
  selected?: boolean
}>()

const emit = defineEmits<{
  select: [id: string]
}>()

const { t, locale } = useI18n()
</script>

<template>
  <button
    type="button"
    class="group w-full px-3 py-3 text-start transition hover:bg-muted/40 lg:py-3.5"
    :class="selected ? 'border-s-2 border-primary bg-primary/5' : 'border-s-2 border-transparent'"
    @click="emit('select', lead.id)"
  >
    <div class="flex items-start justify-between gap-3 lg:items-center">
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-1.5 lg:gap-2">
          <p class="truncate text-sm font-semibold text-highlighted">
            {{ lead.name || lead.email }}
          </p>

          <UBadge size="xs" variant="soft" class="shrink-0">
            {{ getLeadSourceLabel(lead.source, t) }}
          </UBadge>

          <UBadge
            size="xs"
            :color="getLeadStatusColor(lead.status)"
            variant="soft"
            class="shrink-0"
          >
            {{ getLeadStatusLabel(lead.status, t) }}
          </UBadge>

          <UBadge
            v-if="lead.priority === 'HIGH'"
            size="xs"
            color="warning"
            variant="soft"
            class="shrink-0"
          >
            {{ getLeadPriorityLabel(lead.priority, t) }}
          </UBadge>

          <UBadge
            v-if="lead.isFollowUpOverdue"
            size="xs"
            color="warning"
            variant="soft"
            class="shrink-0"
          >
            {{ t('dashboard.leads.overdue') }}
          </UBadge>
        </div>

        <p class="mt-0.5 truncate text-sm text-default">
          {{ lead.subject || t('dashboard.leads.untitled') }}
        </p>

        <p class="mt-1 line-clamp-2 text-xs text-muted lg:line-clamp-1">
          {{ lead.summary }}
        </p>

        <p v-if="lead.nextFollowUpAt" class="mt-1 text-xs text-muted lg:hidden">
          {{ t('dashboard.leads.detail.nextFollowUp') }}:
          {{ formatLeadDate(lead.nextFollowUpAt, locale) }}
        </p>
      </div>

      <time class="shrink-0 text-xs text-muted">
        {{ lead.relativeLastActivityAt }}
      </time>
    </div>
  </button>
</template>
