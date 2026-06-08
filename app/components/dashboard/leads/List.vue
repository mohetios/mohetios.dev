<script setup lang="ts">
import type { LeadTabItem, LeadTabKey } from '~/utils/lead-tabs'
import { getLeadEmptyStateKey } from '~/utils/lead-tabs'
import type { Lead } from '~/utils/lead-normalize'

const props = defineProps<{
  primaryTabs: LeadTabItem[]
  secondaryTabs: LeadTabItem[]
  activeTab: LeadTabKey
  leads: Lead[]
  search: string
  loading: boolean
  selectedLeadId?: string
}>()

const emit = defineEmits<{
  'update:search': [value: string]
  'select-tab': [tab: LeadTabKey]
  'select-lead': [id: string]
}>()

const { t } = useI18n()

const emptyStateKey = computed(() => getLeadEmptyStateKey(props.activeTab))
</script>

<template>
  <section
    class="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-default bg-default lg:min-h-[calc(100vh-var(--dashboard-header-height,4rem)-2rem)]"
  >
    <DashboardLeadsTabs
      :primary-tabs="primaryTabs"
      :secondary-tabs="secondaryTabs"
      :active-tab="activeTab"
      @select-tab="emit('select-tab', $event)"
    />

    <div class="shrink-0 border-b border-default px-3 py-2">
      <UInput
        :model-value="search"
        icon="i-lucide-search"
        :placeholder="t('dashboard.leads.search.placeholder')"
        size="sm"
        class="w-full"
        @update:model-value="emit('update:search', $event)"
      />
    </div>

    <div class="min-h-0 flex-1 overflow-y-auto">
      <div v-if="loading" class="divide-y divide-default">
        <div v-for="index in 6" :key="index" class="px-3 py-4">
          <div class="flex items-start gap-3">
            <USkeleton class="h-4 w-28" />
            <USkeleton class="ms-auto h-3 w-10" />
          </div>
          <USkeleton class="mt-2 h-4 w-full" />
          <USkeleton class="mt-2 h-3 w-4/5" />
        </div>
      </div>

      <DashboardWorkspaceEmpty
        v-else-if="!leads.length"
        icon="i-lucide-user-search"
        :title="t(`dashboard.leads.empty.${emptyStateKey}.title`)"
        :description="t(`dashboard.leads.empty.${emptyStateKey}.description`)"
        class="py-12"
      />

      <div v-else class="divide-y divide-default">
        <DashboardLeadsItem
          v-for="lead in leads"
          :key="lead.id"
          :lead="lead"
          :selected="selectedLeadId === lead.id"
          @select="emit('select-lead', $event)"
        />
      </div>
    </div>
  </section>
</template>
