<script setup lang="ts">
import type {
  LeadItemDto,
  LeadReviewPriorityFilter,
  LeadReviewSourceFilter,
  LeadReviewStatusFilter,
  LeadReviewTypeFilter
} from '~/composables/useLeadWorkspace'
import { useLeadWorkspace } from '~/composables/useLeadWorkspace'
import type { BadgeColor } from '~/utils/inbox-thread'
import {
  dashboardCardUi,
  inboxThreadPanelUi,
  inboxWorkspacePanelUi
} from '~/utils/dashboard-ui'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth'],
  requiredPermission: 'inbox:manage'
})

const { t } = useI18n()
const route = useRoute()
const toast = useToast()

useMohetSeo({
  title: () => t('dashboard.leads.title'),
  description: () => t('dashboard.leads.description')
})

const search = ref('')
const statusFilter = ref<LeadReviewStatusFilter>('ALL')
const typeFilter = ref<LeadReviewTypeFilter>('ALL')
const sourceFilter = ref<LeadReviewSourceFilter>('ALL')
const priorityFilter = ref<LeadReviewPriorityFilter>('ALL')
const selectedLeadId = ref<string | undefined>(
  typeof route.query.lead === 'string' ? route.query.lead : undefined
)
const isRefreshing = ref(false)
const isMutating = ref(false)

const {
  data: leadWorkspace,
  pending: isLoading,
  error: leadsLoadError,
  refresh: refreshLeads,
  updateLeadReview,
  markLeadQualified,
  archiveLead
} = useLeadWorkspace({
  status: statusFilter,
  type: typeFilter,
  source: sourceFilter,
  priority: priorityFilter,
  search,
  selectedLeadId
})

const leads = computed(() => leadWorkspace.value.leads)
const selectedLead = computed(() => leadWorkspace.value.selectedLead || null)

const leadSummaryCards = computed(() => [
  {
    key: 'total',
    label: t('dashboard.leads.summary.total'),
    value: leadWorkspace.value.summary.total,
    icon: 'i-lucide-users',
    helper: t('dashboard.leads.summary.totalHelper')
  },
  {
    key: 'new',
    label: t('dashboard.leads.summary.new'),
    value: leadWorkspace.value.summary.new,
    icon: 'i-lucide-sparkles',
    helper: t('dashboard.leads.summary.newHelper')
  },
  {
    key: 'qualified',
    label: t('dashboard.leads.summary.qualified'),
    value: leadWorkspace.value.summary.qualified,
    icon: 'i-lucide-badge-check',
    helper: t('dashboard.leads.summary.qualifiedHelper')
  },
  {
    key: 'high',
    label: t('dashboard.leads.summary.highPriority'),
    value: leadWorkspace.value.summary.highPriority,
    icon: 'i-lucide-flame',
    helper: t('dashboard.leads.summary.highPriorityHelper')
  }
])

const statusOptions: LeadReviewStatusFilter[] = [
  'ALL',
  'NEW',
  'OPEN',
  'REPLIED',
  'ARCHIVED',
  'SPAM'
]

const typeOptions: LeadReviewTypeFilter[] = [
  'ALL',
  'LEAD',
  'COLLABORATION',
  'PERSONAL',
  'SUPPORT',
  'OTHER'
]

const sourceOptions: LeadReviewSourceFilter[] = ['ALL', 'EMAIL', 'CONTACT_FORM']
const priorityOptions: LeadReviewPriorityFilter[] = ['ALL', 'LOW', 'NORMAL', 'HIGH']

function formatLeadLabel(value: string) {
  return value
    .toLowerCase()
    .replace('_', ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function toSelectItems<T extends string>(values: readonly T[]) {
  return values.map((value) => ({
    label: value === 'ALL' ? t('dashboard.leads.filters.all') : formatLeadLabel(value),
    value
  }))
}

const statusSelectItems = computed(() => toSelectItems(statusOptions))
const typeSelectItems = computed(() => toSelectItems(typeOptions))
const sourceSelectItems = computed(() => toSelectItems(sourceOptions))
const prioritySelectItems = computed(() => toSelectItems(priorityOptions))

function getLeadStatusColor(status: LeadItemDto['status']): BadgeColor {
  return {
    NEW: 'primary',
    OPEN: 'success',
    REPLIED: 'info',
    ARCHIVED: 'neutral',
    SPAM: 'error'
  }[status] as BadgeColor
}

function getLeadPriorityColor(priority: LeadItemDto['priority']): BadgeColor {
  return {
    LOW: 'neutral',
    NORMAL: 'info',
    HIGH: 'error'
  }[priority] as BadgeColor
}

function getLeadSourceIcon(source: LeadItemDto['source']) {
  return {
    EMAIL: 'i-lucide-mail',
    CONTACT_FORM: 'i-lucide-inbox'
  }[source]
}

function getLeadSourceColor(source: LeadItemDto['source']) {
  return {
    EMAIL: 'text-primary',
    CONTACT_FORM: 'text-emerald-600 dark:text-emerald-400'
  }[source]
}

function formatDate(value?: number | null) {
  if (!value) return '—'

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value))
}

function selectLead(id: string) {
  selectedLeadId.value = id

  navigateTo(
    {
      path: route.path,
      query: {
        ...route.query,
        lead: id
      }
    },
    { replace: true }
  )
}

const contactFields = computed(() => {
  const lead = selectedLead.value
  if (!lead) return []

  return [
    { label: t('dashboard.leads.fields.name'), value: lead.name },
    { label: t('dashboard.leads.fields.email'), value: lead.email },
    { label: t('dashboard.leads.fields.company'), value: lead.company },
    { label: t('dashboard.leads.fields.website'), value: lead.website },
    { label: t('dashboard.leads.fields.source'), value: formatLeadLabel(lead.source) }
  ]
})

const opportunityFields = computed(() => {
  const lead = selectedLead.value
  if (!lead) return []

  return [
    { label: t('dashboard.leads.fields.type'), value: formatLeadLabel(lead.kind) },
    { label: t('dashboard.leads.fields.status'), value: formatLeadLabel(lead.status) },
    { label: t('dashboard.leads.fields.priority'), value: formatLeadLabel(lead.priority) },
    { label: t('dashboard.leads.fields.created'), value: formatDate(lead.createdAt) },
    { label: t('dashboard.leads.fields.lastActivity'), value: formatDate(lead.lastActivityAt) },
    { label: t('dashboard.leads.fields.lastContacted'), value: formatDate(lead.lastContactedAt) }
  ]
})

async function loadLeads() {
  isRefreshing.value = true

  try {
    await refreshLeads()
  } catch (error) {
    toast.add({
      color: 'error',
      icon: 'i-lucide-circle-alert',
      title: getLeadErrorMessage(error)
    })
  } finally {
    isRefreshing.value = false
  }
}

function getLeadErrorMessage(error: unknown) {
  if (!error || typeof error !== 'object') {
    return t('dashboard.leads.errors.loadFailed')
  }

  const currentError = error as {
    message?: string
    statusMessage?: string
    data?: {
      message?: string
      statusMessage?: string
    }
  }

  const message =
    currentError.data?.message ||
    currentError.data?.statusMessage ||
    currentError.statusMessage ||
    currentError.message

  if (!message) {
    return t('dashboard.leads.errors.loadFailed')
  }

  if (message.includes('no such table: inbox_messages')) {
    return 'Inbox database table is missing. Apply the inbox migration.'
  }

  return message
}

async function markSelectedQualified() {
  if (!selectedLead.value) return

  isMutating.value = true

  try {
    await markLeadQualified(selectedLead.value.id)

    toast.add({
      color: 'success',
      icon: 'i-lucide-badge-check',
      title: t('dashboard.leads.actions.markedQualified')
    })
  } catch (error) {
    toast.add({
      color: 'error',
      icon: 'i-lucide-circle-alert',
      title: getLeadErrorMessage(error)
    })
  } finally {
    isMutating.value = false
  }
}

async function markSelectedWaiting() {
  if (!selectedLead.value) return

  isMutating.value = true

  try {
    await updateLeadReview({
      id: selectedLead.value.id,
      status: 'OPEN'
    })

    toast.add({
      color: 'success',
      icon: 'i-lucide-clock',
      title: t('dashboard.leads.actions.markedWaiting')
    })
  } catch (error) {
    toast.add({
      color: 'error',
      icon: 'i-lucide-circle-alert',
      title: getLeadErrorMessage(error)
    })
  } finally {
    isMutating.value = false
  }
}

async function archiveSelectedLead() {
  if (!selectedLead.value) return

  isMutating.value = true

  try {
    await archiveLead(selectedLead.value.id)

    toast.add({
      color: 'success',
      icon: 'i-lucide-archive',
      title: t('dashboard.leads.actions.archived')
    })
  } catch (error) {
    toast.add({
      color: 'error',
      icon: 'i-lucide-circle-alert',
      title: getLeadErrorMessage(error)
    })
  } finally {
    isMutating.value = false
  }
}

async function markSelectedHighPriority() {
  if (!selectedLead.value) return

  isMutating.value = true

  try {
    await updateLeadReview({
      id: selectedLead.value.id,
      priority: 'HIGH'
    })

    toast.add({
      color: 'success',
      icon: 'i-lucide-flame',
      title: t('dashboard.leads.actions.markedHighPriority')
    })
  } catch (error) {
    toast.add({
      color: 'error',
      icon: 'i-lucide-circle-alert',
      title: getLeadErrorMessage(error)
    })
  } finally {
    isMutating.value = false
  }
}

watch(
  () => route.query.lead,
  (leadId) => {
    selectedLeadId.value = typeof leadId === 'string' ? leadId : undefined
  }
)

watch(
  () => leadWorkspace.value.leads,
  (currentLeads) => {
    if (!currentLeads.length) {
      selectedLeadId.value = undefined
      return
    }

    if (!selectedLeadId.value && currentLeads[0]) {
      selectLead(currentLeads[0].id)
    }
  },
  { immediate: true }
)

watch(leadsLoadError, (error) => {
  if (!error || import.meta.server) return

  toast.add({
    color: 'error',
    icon: 'i-lucide-circle-alert',
    title: getLeadErrorMessage(error)
  })
})
</script>

<template>
  <div class="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 flex-col gap-6">
    <section class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div class="flex min-w-0 items-start gap-3">
        <div>
          <h1 class="text-3xl font-semibold tracking-tight text-highlighted">
            {{ t('dashboard.leads.title') }}
          </h1>
          <p class="mt-1 text-sm text-muted">
            {{ t('dashboard.leads.description') }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <UButton
          color="neutral"
          variant="ghost"
          icon="i-lucide-refresh-cw"
          :loading="isRefreshing"
          @click="loadLeads"
        >
          {{ t('dashboard.leads.refresh') }}
        </UButton>

        <UButton
          color="primary"
          variant="soft"
          icon="i-lucide-plus"
          disabled
        >
          {{ t('dashboard.leads.addManualLead') }}
        </UButton>
      </div>
    </section>

    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <template v-if="isLoading">
        <USkeleton v-for="item in 4" :key="item" class="h-28 w-full rounded-2xl" />
      </template>

      <template v-else>
        <DashboardInboxSummaryCard
          v-for="card in leadSummaryCards"
          :key="card.key"
          :label="card.label"
          :value="card.value"
          :icon="card.icon"
          :helper="card.helper"
        />
      </template>
    </section>

    <section
      class="flex flex-col gap-3 rounded-2xl border border-default bg-default p-3 lg:flex-row lg:items-center lg:justify-between"
    >
      <div class="grid grid-cols-1 gap-2 sm:grid-cols-4 lg:flex lg:items-center">
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

        <USelect
          v-model="priorityFilter"
          :items="prioritySelectItems"
          value-key="value"
          label-key="label"
          icon="i-lucide-flame"
          class="w-full lg:w-44"
        />
      </div>

      <UInput
        v-model="search"
        icon="i-lucide-search"
        :placeholder="t('dashboard.leads.searchPlaceholder')"
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
              {{ t('dashboard.leads.board.title') }}
            </h2>
            <p class="text-xs text-muted">
              {{ leads.length }} {{ t('dashboard.leads.board.of') }}
              {{ leadWorkspace.summary.total }}
              {{ t('dashboard.leads.board.opportunities') }}
            </p>
          </div>
        </template>

        <div v-if="isLoading" class="space-y-3 p-4">
          <USkeleton v-for="item in 5" :key="item" class="h-28 w-full" />
        </div>

        <div v-else-if="leads.length" class="divide-y divide-default">
          <button
            v-for="lead in leads"
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
              <div class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted/60">
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
                    {{ formatDate(lead.lastContactedAt || lead.createdAt) }}
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
                    {{ formatLeadLabel(lead.kind) }}
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
            {{ t('dashboard.leads.empty.title') }}
          </h3>
          <p class="mt-1 text-sm text-muted">
            {{ t('dashboard.leads.empty.description') }}
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
              <p v-if="selectedLead.company" class="text-sm text-muted">
                {{ selectedLead.company }}
              </p>
              <div class="mt-2 flex flex-wrap gap-2">
                <UBadge :color="getLeadStatusColor(selectedLead.status)" variant="subtle">
                  {{ formatLeadLabel(selectedLead.status) }}
                </UBadge>
                <UBadge :color="getLeadPriorityColor(selectedLead.priority)" variant="soft">
                  {{ formatLeadLabel(selectedLead.priority) }}
                </UBadge>
              </div>
            </div>

            <div class="flex flex-wrap gap-2">
              <UButton
                color="primary"
                variant="soft"
                icon="i-lucide-inbox"
                size="sm"
                :to="`/dashboard/inbox?message=${selectedLead.relatedInboxMessageId}`"
              >
                {{ t('dashboard.leads.actions.openInboxThread') }}
              </UButton>

              <UButton
                color="success"
                variant="outline"
                icon="i-lucide-badge-check"
                size="sm"
                :loading="isMutating"
                @click="markSelectedQualified"
              >
                {{ t('dashboard.leads.actions.markQualified') }}
              </UButton>

              <UButton
                color="warning"
                variant="outline"
                icon="i-lucide-clock"
                size="sm"
                :loading="isMutating"
                @click="markSelectedWaiting"
              >
                {{ t('dashboard.leads.actions.markWaiting') }}
              </UButton>

              <UButton
                color="error"
                variant="outline"
                icon="i-lucide-flame"
                size="sm"
                :loading="isMutating"
                @click="markSelectedHighPriority"
              >
                {{ t('dashboard.leads.actions.highPriority') }}
              </UButton>

              <UButton
                color="neutral"
                variant="ghost"
                icon="i-lucide-archive"
                size="sm"
                :loading="isMutating"
                @click="archiveSelectedLead"
              >
                {{ t('dashboard.leads.actions.archive') }}
              </UButton>
            </div>
          </div>
        </template>

        <div class="space-y-6">
          <div class="rounded-2xl bg-muted/40 px-4 py-3">
            <h3 class="text-xs font-semibold uppercase tracking-wide text-muted">
              {{ t('dashboard.leads.sections.summary') }}
            </h3>
            <p class="mt-2 text-sm leading-6 text-highlighted">
              {{ selectedLead.summary }}
            </p>
          </div>

          <div class="grid gap-4 lg:grid-cols-2">
            <UCard variant="outline" :ui="dashboardCardUi">
              <template #header>
                <h3 class="text-sm font-semibold text-highlighted">
                  {{ t('dashboard.leads.sections.contact') }}
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
                  {{ t('dashboard.leads.sections.opportunity') }}
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
              {{ t('dashboard.leads.sections.tags') }}
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

          <UCard variant="outline" :ui="dashboardCardUi" class="border-dashed">
            <div class="flex items-start gap-3">
              <UIcon name="i-lucide-sticky-note" class="mt-0.5 size-4 text-muted" />
              <div>
                <h3 class="text-sm font-semibold text-highlighted">
                  {{ t('dashboard.leads.notes.title') }}
                </h3>
                <p class="mt-1 text-sm text-muted">
                  {{ t('dashboard.leads.notes.description') }}
                </p>
              </div>
            </div>
          </UCard>
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
            {{ t('dashboard.leads.select.title') }}
          </h2>
          <p class="mt-2 text-sm text-muted">
            {{ t('dashboard.leads.select.description') }}
          </p>
        </div>
      </UCard>
    </section>
  </div>
</template>
