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
import { dashboardCardUi } from '~/utils/dashboard-ui'

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
  <DashboardWorkspacePage
    :title="t('dashboard.leads.title')"
    :description="t('dashboard.leads.description')"
  >
    <template #actions>
      <UButton
        color="neutral"
        variant="ghost"
        icon="i-lucide-refresh-cw"
        :loading="isRefreshing"
        size="sm"
        @click="loadLeads"
      >
        {{ t('dashboard.leads.refresh') }}
      </UButton>

      <UButton
        color="primary"
        variant="soft"
        icon="i-lucide-plus"
        size="sm"
        disabled
      >
        {{ t('dashboard.leads.addManualLead') }}
      </UButton>
    </template>

    <template #summary>
      <DashboardWorkspaceSummary :items="leadSummaryCards" :loading="isLoading" />
    </template>

    <template #filters>
      <DashboardWorkspaceFilterBar>
        <template #filters>
          <USelect
            v-model="statusFilter"
            :items="statusSelectItems"
            value-key="value"
            label-key="label"
            icon="i-lucide-circle-dot"
            size="sm"
            class="w-full sm:w-40"
          />

          <USelect
            v-model="typeFilter"
            :items="typeSelectItems"
            value-key="value"
            label-key="label"
            icon="i-lucide-tag"
            size="sm"
            class="w-full sm:w-40"
          />

          <USelect
            v-model="sourceFilter"
            :items="sourceSelectItems"
            value-key="value"
            label-key="label"
            icon="i-lucide-radio"
            size="sm"
            class="w-full sm:w-40"
          />

          <USelect
            v-model="priorityFilter"
            :items="prioritySelectItems"
            value-key="value"
            label-key="label"
            icon="i-lucide-flame"
            size="sm"
            class="w-full sm:w-40"
          />
        </template>

        <template #search>
          <UInput
            v-model="search"
            icon="i-lucide-search"
            :placeholder="t('dashboard.leads.searchPlaceholder')"
            size="sm"
          />
        </template>
      </DashboardWorkspaceFilterBar>
    </template>

    <DashboardWorkspaceListPanel
      fill-height
      flush-list
      :title="t('dashboard.leads.board.title')"
      :description="`${leads.length} ${t('dashboard.leads.board.of')} ${leadWorkspace.summary.total} ${t('dashboard.leads.board.opportunities')}`"
      :loading="isLoading"
      :empty="!leads.length"
      :empty-title="t('dashboard.leads.empty.title')"
      :empty-description="t('dashboard.leads.empty.description')"
      empty-icon="i-lucide-users"
    >
      <div class="divide-y divide-default">
        <button
          v-for="lead in leads"
          :key="lead.id"
          type="button"
          class="block w-full border-s-2 py-2.5 px-0 text-start transition hover:bg-muted/40"
          :class="
            selectedLead?.id === lead.id
              ? 'border-primary bg-primary/5'
              : 'border-transparent'
          "
          :aria-selected="selectedLead?.id === lead.id"
          @click="selectLead(lead.id)"
        >
          <div class="flex items-start gap-3 px-2">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/60">
              <UIcon
                :name="getLeadSourceIcon(lead.source)"
                class="size-4"
                :class="getLeadSourceColor(lead.source)"
              />
            </div>

            <div class="min-w-0 flex-1">
              <div class="flex items-start justify-between gap-2">
                <p class="truncate text-sm font-medium text-highlighted">
                  {{ lead.title }}
                </p>

                <span class="shrink-0 text-[11px] text-muted">
                  {{ formatDate(lead.lastContactedAt || lead.createdAt) }}
                </span>
              </div>

              <p class="mt-0.5 truncate text-xs text-muted">
                {{ lead.name }} · {{ lead.company || lead.email }}
              </p>

              <p class="mt-1 line-clamp-2 text-xs leading-5 text-muted">
                {{ lead.summary }}
              </p>

              <div class="mt-2 flex flex-wrap gap-1.5">
                <UBadge :color="getLeadStatusColor(lead.status)" variant="subtle" size="xs">
                  {{ formatLeadLabel(lead.status) }}
                </UBadge>

                <UBadge color="neutral" variant="soft" size="xs">
                  {{ formatLeadLabel(lead.kind) }}
                </UBadge>

                <UBadge :color="getLeadPriorityColor(lead.priority)" variant="soft" size="xs">
                  {{ formatLeadLabel(lead.priority) }}
                </UBadge>
              </div>
            </div>
          </div>
        </button>
      </div>
    </DashboardWorkspaceListPanel>

    <DashboardWorkspaceDetailPanel
      :empty="!selectedLead"
      empty-icon="i-lucide-users"
      :empty-title="t('dashboard.leads.select.title')"
      :empty-description="t('dashboard.leads.select.description')"
    >
      <template #header>
        <div v-if="selectedLead" class="space-y-3">
          <div class="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
            <div class="min-w-0">
              <h2 class="truncate text-base font-semibold tracking-tight text-highlighted">
                {{ selectedLead.title }}
              </h2>

              <p class="mt-1 truncate text-sm text-muted">
                {{ selectedLead.name }} · {{ selectedLead.email }}
              </p>

              <p
                v-if="selectedLead.company"
                class="mt-0.5 truncate text-sm text-muted"
              >
                {{ selectedLead.company }}
              </p>

              <div class="mt-2 flex flex-wrap gap-1.5">
                <UBadge :color="getLeadStatusColor(selectedLead.status)" variant="subtle" size="sm">
                  {{ formatLeadLabel(selectedLead.status) }}
                </UBadge>

                <UBadge :color="getLeadPriorityColor(selectedLead.priority)" variant="soft" size="sm">
                  {{ formatLeadLabel(selectedLead.priority) }}
                </UBadge>
              </div>
            </div>

            <div class="flex shrink-0 flex-wrap gap-1.5">
              <UButton
                color="primary"
                variant="soft"
                icon="i-lucide-inbox"
                size="xs"
                :to="`/dashboard/inbox?message=${selectedLead.relatedInboxMessageId}`"
              >
                {{ t('dashboard.leads.actions.openInboxThread') }}
              </UButton>

              <UButton
                color="success"
                variant="outline"
                icon="i-lucide-badge-check"
                size="xs"
                :loading="isMutating"
                @click="markSelectedQualified"
              >
                {{ t('dashboard.leads.actions.markQualified') }}
              </UButton>

              <UButton
                color="warning"
                variant="outline"
                icon="i-lucide-clock"
                size="xs"
                :loading="isMutating"
                @click="markSelectedWaiting"
              >
                {{ t('dashboard.leads.actions.markWaiting') }}
              </UButton>

              <UButton
                color="error"
                variant="outline"
                icon="i-lucide-flame"
                size="xs"
                :loading="isMutating"
                @click="markSelectedHighPriority"
              >
                {{ t('dashboard.leads.actions.highPriority') }}
              </UButton>

              <UButton
                color="neutral"
                variant="ghost"
                icon="i-lucide-archive"
                size="xs"
                :loading="isMutating"
                @click="archiveSelectedLead"
              >
                {{ t('dashboard.leads.actions.archive') }}
              </UButton>
            </div>
          </div>
        </div>
      </template>

      <div v-if="selectedLead" class="space-y-5">
        <div class="rounded-2xl bg-muted/40 px-4 py-3">
          <h3 class="text-xs font-semibold uppercase tracking-wide text-muted">
            {{ t('dashboard.leads.sections.summary') }}
          </h3>

          <p class="mt-2 text-sm leading-6 text-highlighted">
            {{ selectedLead.summary }}
          </p>
        </div>

        <div class="grid gap-3 xl:grid-cols-2">
          <UCard variant="outline" :ui="dashboardCardUi">
            <template #header>
              <h3 class="text-sm font-semibold text-highlighted">
                {{ t('dashboard.leads.sections.contact') }}
              </h3>
            </template>

            <dl class="space-y-2 text-sm">
              <div v-for="field in contactFields" :key="field.label">
                <dt class="text-xs text-muted">{{ field.label }}</dt>
                <dd class="mt-0.5 truncate text-highlighted">
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

            <dl class="space-y-2 text-sm">
              <div v-for="field in opportunityFields" :key="field.label">
                <dt class="text-xs text-muted">{{ field.label }}</dt>
                <dd class="mt-0.5 truncate text-highlighted">
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

          <div class="mt-2 flex flex-wrap gap-1.5">
            <UBadge
              v-for="tag in selectedLead.tags"
              :key="tag"
              color="neutral"
              variant="soft"
              size="xs"
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
    </DashboardWorkspaceDetailPanel>
  </DashboardWorkspacePage>
</template>
