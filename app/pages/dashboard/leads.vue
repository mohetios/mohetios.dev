<script setup lang="ts">
import type {
  Lead,
  LeadPriority,
  LeadSource,
  LeadStatus,
  LeadType
} from '~/data/leads.mock'
import { leads } from '~/data/leads.mock'
import type { BadgeColor } from '~/utils/inbox-thread'
import { dashboardCardUi, inboxThreadPanelUi, inboxWorkspacePanelUi } from '~/utils/dashboard-ui'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth'],
  requiredPermission: 'inbox:manage'
})

useMohetSeo({
  title: 'Leads',
  description:
    'Review collaboration, freelance, and partnership opportunities from the Mohetios inbox.'
})

const leadsSource = ref<Lead[]>(leads)

const search = ref('')
const statusFilter = ref<'all' | LeadStatus>('all')
const typeFilter = ref<'all' | LeadType>('all')
const sourceFilter = ref<'all' | LeadSource>('all')
const selectedLeadId = ref<string | undefined>(leads[0]?.id)

const statusOptions: Array<'all' | LeadStatus> = [
  'all',
  'new',
  'qualified',
  'contacted',
  'waiting',
  'won',
  'lost',
  'archived'
]

const typeOptions: Array<'all' | LeadType> = [
  'all',
  'freelance',
  'collaboration',
  'partnership',
  'speaking',
  'support',
  'other'
]

const sourceOptions: Array<'all' | LeadSource> = ['all', 'email', 'contact_form', 'manual']

const leadSummaryCards = computed(() => {
  const currentLeads = leadsSource.value

  return [
    {
      key: 'total',
      label: 'Total Leads',
      value: currentLeads.length,
      icon: 'i-lucide-users',
      helper: 'All tracked opportunities'
    },
    {
      key: 'new',
      label: 'New',
      value: currentLeads.filter((lead) => lead.status === 'new').length,
      icon: 'i-lucide-sparkles',
      helper: 'Not yet reviewed'
    },
    {
      key: 'qualified',
      label: 'Qualified',
      value: currentLeads.filter((lead) => lead.status === 'qualified').length,
      icon: 'i-lucide-badge-check',
      helper: 'Worth pursuing'
    },
    {
      key: 'high',
      label: 'High Priority',
      value: currentLeads.filter((lead) => lead.priority === 'high').length,
      icon: 'i-lucide-flame',
      helper: 'Needs attention soon'
    }
  ]
})

function toSelectItems<T extends string>(values: readonly T[]) {
  return values.map((value) => ({
    label: value === 'all' ? 'All' : formatLeadLabel(value),
    value
  }))
}

const statusSelectItems = computed(() => toSelectItems(statusOptions))
const typeSelectItems = computed(() => toSelectItems(typeOptions))
const sourceSelectItems = computed(() => toSelectItems(sourceOptions))

const filteredLeads = computed(() => {
  const query = search.value.trim().toLowerCase()

  return leadsSource.value.filter((lead) => {
    const haystack = [
      lead.name,
      lead.email,
      lead.company,
      lead.title,
      lead.summary,
      lead.tags.join(' ')
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    const matchesSearch = !query || haystack.includes(query)
    const matchesStatus = statusFilter.value === 'all' || lead.status === statusFilter.value
    const matchesType = typeFilter.value === 'all' || lead.type === typeFilter.value
    const matchesSource = sourceFilter.value === 'all' || lead.source === sourceFilter.value

    return matchesSearch && matchesStatus && matchesType && matchesSource
  })
})

const selectedLead = computed<Lead | null>(() => {
  return (
    filteredLeads.value.find((lead) => lead.id === selectedLeadId.value) ||
    filteredLeads.value[0] ||
    null
  )
})

watch(
  filteredLeads,
  (currentLeads) => {
    if (currentLeads.some((lead) => lead.id === selectedLeadId.value)) {
      return
    }

    selectedLeadId.value = currentLeads[0]?.id
  },
  { immediate: true }
)

function selectLead(id: string) {
  selectedLeadId.value = id
}

function getLeadStatusColor(status: LeadStatus): BadgeColor {
  return {
    new: 'primary',
    qualified: 'success',
    contacted: 'info',
    waiting: 'warning',
    won: 'success',
    lost: 'error',
    archived: 'neutral'
  }[status] as BadgeColor
}

function getLeadPriorityColor(priority: LeadPriority): BadgeColor {
  return {
    low: 'neutral',
    normal: 'info',
    high: 'error'
  }[priority] as BadgeColor
}

function getLeadSourceIcon(source: LeadSource) {
  return {
    email: 'i-lucide-mail',
    contact_form: 'i-lucide-inbox',
    manual: 'i-lucide-pencil'
  }[source]
}

function getLeadSourceColor(source: LeadSource) {
  return {
    email: 'text-primary',
    contact_form: 'text-emerald-600 dark:text-emerald-400',
    manual: 'text-amber-600 dark:text-amber-400'
  }[source]
}

function formatLeadLabel(value: string) {
  return value
    .replace('_', ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

const contactFields = computed(() => {
  const lead = selectedLead.value
  if (!lead) return []

  return [
    { label: 'Name', value: lead.name },
    { label: 'Email', value: lead.email },
    { label: 'Company', value: lead.company },
    { label: 'Website', value: lead.website },
    { label: 'Location', value: lead.location },
    { label: 'Source', value: formatLeadLabel(lead.source) }
  ]
})

const opportunityFields = computed(() => {
  const lead = selectedLead.value
  if (!lead) return []

  return [
    { label: 'Type', value: formatLeadLabel(lead.type) },
    { label: 'Status', value: formatLeadLabel(lead.status) },
    { label: 'Priority', value: formatLeadLabel(lead.priority) },
    { label: 'Budget', value: lead.budget },
    { label: 'Created', value: lead.createdAt },
    { label: 'Last Contacted', value: lead.lastContactedAt }
  ]
})
</script>

<template>
  <div class="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 flex-col gap-6">
    <section class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div class="flex min-w-0 items-start gap-3">
        <div>
          <h1 class="text-3xl font-semibold tracking-tight text-highlighted">
            Leads
          </h1>
          <p class="mt-1 text-sm text-muted">
            Review opportunities from email and contact-form conversations.
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <UButton color="neutral" variant="ghost" icon="i-lucide-refresh-cw" disabled>
          Refresh
        </UButton>
        <UButton color="primary" variant="soft" icon="i-lucide-plus" disabled>
          Add manual lead
        </UButton>
      </div>
    </section>

    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <DashboardInboxSummaryCard
        v-for="card in leadSummaryCards"
        :key="card.key"
        :label="card.label"
        :value="card.value"
        :icon="card.icon"
        :helper="card.helper"
      />
    </section>

    <section
      class="flex flex-col gap-3 rounded-2xl border border-default bg-default p-3 lg:flex-row lg:items-center lg:justify-between"
    >
      <div class="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:flex lg:items-center">
        <USelect
          v-model="statusFilter"
          :items="statusSelectItems"
          value-key="value"
          label-key="label"
          icon="i-lucide-circle-dot"
          class="w-full lg:w-44"
        />
        <USelect
          v-model="typeFilter"
          :items="typeSelectItems"
          value-key="value"
          label-key="label"
          icon="i-lucide-tag"
          class="w-full lg:w-44"
        />
        <USelect
          v-model="sourceFilter"
          :items="sourceSelectItems"
          value-key="value"
          label-key="label"
          icon="i-lucide-radio"
          class="w-full lg:w-44"
        />
      </div>

      <UInput
        v-model="search"
        icon="i-lucide-search"
        placeholder="Search leads..."
        class="w-full lg:w-72"
      />
    </section>

    <section
      class="grid min-h-0 flex-1 gap-4 lg:h-[calc(100dvh-18rem)] lg:grid-cols-[440px_1fr] lg:items-stretch"
    >
      <UCard :ui="inboxThreadPanelUi">
        <template #header>
          <div>
            <h2 class="text-sm font-semibold text-highlighted">
              Lead board
            </h2>
            <p class="text-xs text-muted">
              {{ filteredLeads.length }} of {{ leadsSource.length }} opportunities
            </p>
          </div>
        </template>

        <div v-if="filteredLeads.length" class="divide-y divide-default">
          <button
            v-for="lead in filteredLeads"
            :key="lead.id"
            type="button"
            class="block w-full border-s-2 px-4 py-3 text-start transition hover:bg-muted/40"
            :class="
              selectedLead?.id === lead.id
                ? 'border-primary bg-primary/5'
                : 'border-transparent'
            "
            @click="selectLead(lead.id)"
          >
            <div class="flex items-start gap-3">
              <div
                class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted/60"
              >
                <UIcon
                  :name="getLeadSourceIcon(lead.source)"
                  class="size-4"
                  :class="getLeadSourceColor(lead.source)"
                />
              </div>

              <div class="min-w-0 flex-1 space-y-1">
                <div class="flex items-start justify-between gap-3">
                  <p class="truncate text-sm font-medium text-highlighted">
                    {{ lead.title }}
                  </p>
                  <span class="shrink-0 text-xs text-muted">
                    {{ lead.lastContactedAt || lead.createdAt }}
                  </span>
                </div>

                <p class="truncate text-xs text-muted">
                  {{ lead.name }} · {{ lead.company || lead.email }}
                </p>

                <p class="line-clamp-2 text-xs leading-5 text-muted">
                  {{ lead.summary }}
                </p>

                <div class="flex flex-wrap gap-2 pt-1">
                  <UBadge :color="getLeadStatusColor(lead.status)" variant="subtle" size="sm">
                    {{ formatLeadLabel(lead.status) }}
                  </UBadge>
                  <UBadge color="neutral" variant="soft" size="sm">
                    {{ formatLeadLabel(lead.type) }}
                  </UBadge>
                  <UBadge color="neutral" variant="outline" size="sm">
                    {{ formatLeadLabel(lead.source) }}
                  </UBadge>
                  <UBadge :color="getLeadPriorityColor(lead.priority)" variant="soft" size="sm">
                    {{ formatLeadLabel(lead.priority) }}
                  </UBadge>
                </div>
              </div>
            </div>
          </button>
        </div>

        <div v-else class="p-8 text-center">
          <div class="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-muted">
            <UIcon name="i-lucide-users" class="size-5 text-muted" />
          </div>
          <h3 class="text-sm font-medium text-highlighted">
            No leads found
          </h3>
          <p class="mt-1 text-sm text-muted">
            Try a different search or filter.
          </p>
        </div>
      </UCard>

      <UCard v-if="selectedLead" :ui="inboxWorkspacePanelUi">
        <template #header>
          <div class="space-y-4">
            <div class="min-w-0">
              <h2 class="text-lg font-semibold tracking-tight text-highlighted">
                {{ selectedLead.title }}
              </h2>
              <p class="mt-1 text-sm text-muted">
                {{ selectedLead.name }} · {{ selectedLead.email }}
              </p>
              <p v-if="selectedLead.company || selectedLead.location" class="text-sm text-muted">
                {{ [selectedLead.company, selectedLead.location].filter(Boolean).join(' · ') }}
              </p>
              <div class="mt-2 flex flex-wrap gap-2">
                <UBadge :color="getLeadStatusColor(selectedLead.status)" variant="subtle">
                  {{ formatLeadLabel(selectedLead.status) }}
                </UBadge>
                <UBadge :color="getLeadPriorityColor(selectedLead.priority)" variant="soft">
                  {{ formatLeadLabel(selectedLead.priority) }} priority
                </UBadge>
              </div>
            </div>

            <div class="flex flex-wrap gap-2">
              <UButton
                v-if="selectedLead.relatedInboxThreadId"
                color="primary"
                variant="soft"
                icon="i-lucide-inbox"
                size="sm"
                :to="`/dashboard/inbox?message=${selectedLead.relatedInboxThreadId}`"
              >
                Open Inbox Thread
              </UButton>
              <UButton color="success" variant="outline" icon="i-lucide-badge-check" size="sm" disabled>
                Mark Qualified
              </UButton>
              <UButton color="warning" variant="outline" icon="i-lucide-clock" size="sm" disabled>
                Mark Waiting
              </UButton>
              <UButton color="neutral" variant="ghost" icon="i-lucide-archive" size="sm" disabled>
                Archive
              </UButton>
            </div>
          </div>
        </template>

        <div class="space-y-6">
          <div class="rounded-2xl bg-muted/40 px-4 py-3">
            <h3 class="text-xs font-semibold uppercase tracking-wide text-muted">
              Summary
            </h3>
            <p class="mt-2 text-sm leading-6 text-highlighted">
              {{ selectedLead.summary }}
            </p>
          </div>

          <div class="grid gap-4 lg:grid-cols-2">
            <UCard variant="outline" :ui="dashboardCardUi">
              <template #header>
                <h3 class="text-sm font-semibold text-highlighted">
                  Contact
                </h3>
              </template>

              <dl class="space-y-3 text-sm">
                <div v-for="field in contactFields" :key="field.label">
                  <dt class="text-muted">{{ field.label }}</dt>
                  <dd class="mt-0.5 text-highlighted">
                    {{ field.value || '—' }}
                  </dd>
                </div>
              </dl>
            </UCard>

            <UCard variant="outline" :ui="dashboardCardUi">
              <template #header>
                <h3 class="text-sm font-semibold text-highlighted">
                  Opportunity
                </h3>
              </template>

              <dl class="space-y-3 text-sm">
                <div v-for="field in opportunityFields" :key="field.label">
                  <dt class="text-muted">{{ field.label }}</dt>
                  <dd class="mt-0.5 text-highlighted">
                    {{ field.value || '—' }}
                  </dd>
                </div>
              </dl>
            </UCard>
          </div>

          <div v-if="selectedLead.tags.length">
            <h3 class="text-xs font-semibold uppercase tracking-wide text-muted">
              Tags
            </h3>
            <div class="mt-2 flex flex-wrap gap-2">
              <UBadge
                v-for="tag in selectedLead.tags"
                :key="tag"
                color="neutral"
                variant="soft"
                size="sm"
              >
                {{ tag }}
              </UBadge>
            </div>
          </div>

          <div v-if="selectedLead.notes?.length">
            <h3 class="text-xs font-semibold uppercase tracking-wide text-muted">
              Notes
            </h3>
            <div class="mt-2 space-y-2">
              <div
                v-for="(note, index) in selectedLead.notes"
                :key="index"
                class="rounded-xl border border-dashed border-muted bg-muted/30 px-3 py-2 text-sm text-muted"
              >
                {{ note }}
              </div>
            </div>
          </div>
        </div>
      </UCard>

      <UCard
        v-else
        :ui="dashboardCardUi"
        class="flex min-h-[calc(100dvh-18rem)] items-center justify-center lg:h-full lg:min-h-0"
      >
        <div class="max-w-sm p-8 text-center">
          <div class="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
            <UIcon name="i-lucide-users" class="size-6 text-muted" />
          </div>
          <h2 class="text-base font-semibold text-highlighted">
            Select a lead
          </h2>
          <p class="mt-2 text-sm text-muted">
            Choose a lead to review details and next action.
          </p>
        </div>
      </UCard>
    </section>
  </div>
</template>
