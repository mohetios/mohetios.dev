<script setup lang="ts">
import { useLeadsWorkspace } from '~/composables/useLeadsWorkspace'
import type { LeadPriority, LeadStatus } from '~/composables/useLeadsWorkspace'
import { normalizeLeadDto } from '~/utils/lead-normalize'
import {
  getLeadTabI18nKey,
  leadTabToFilter,
  parseLeadTab,
  PRIMARY_LEAD_TABS,
  SECONDARY_LEAD_TABS,
  type LeadTabItem,
  type LeadTabKey
} from '~/utils/lead-tabs'
import { withDashboardRefresh } from '~/utils/dashboard-refresh'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth'],
  requiredPermission: 'leads:manage'
})

const { t, locale } = useI18n()
const route = useRoute()
const toast = useToast()

useMohetSeo({
  title: () => t('dashboard.leads.title'),
  description: () => t('dashboard.leads.description')
})

const activeTab = computed(() => parseLeadTab(route.query.tab))
const activeFilter = computed(() => leadTabToFilter[activeTab.value])

const search = ref('')
const selectedLeadId = ref<string | undefined>(
  typeof route.query.lead === 'string' ? route.query.lead : undefined
)

const {
  data: leadsWorkspace,
  pending: isLoading,
  error: leadsLoadError,
  refresh: refreshLeads,
  updateLeadStatus,
  updateLeadPriority,
  updateLeadFollowUp,
  updateLeadNotes
} = useLeadsWorkspace({
  filter: activeFilter,
  search,
  selectedLeadId
})

const isRefreshing = ref(false)
const isMutating = ref(false)
const isLeadDrawerOpen = ref(false)
const canUseLeadDrawer = ref(false)

const leads = computed(() =>
  leadsWorkspace.value.leads.map((lead) => normalizeLeadDto(lead, locale.value))
)

const hasLeadsWorkspaceData = computed(() => {
  const summary = leadsWorkspace.value.summary

  return (
    summary.total > 0 ||
    summary.new > 0 ||
    summary.qualified > 0 ||
    summary.followUp > 0 ||
    summary.won > 0 ||
    summary.lost > 0 ||
    summary.archived > 0 ||
    leadsWorkspace.value.leads.length > 0 ||
    Boolean(leadsWorkspace.value.selectedLead)
  )
})

const isInitialLeadsLoading = computed(() => isLoading.value && !hasLeadsWorkspaceData.value)

const selectedLead = computed(() =>
  leadsWorkspace.value.selectedLead
    ? normalizeLeadDto(leadsWorkspace.value.selectedLead, locale.value)
    : null
)

const isLeadDetailLoading = computed(
  () => Boolean(selectedLeadId.value) && isLoading.value && !selectedLead.value
)

const tabCounts = computed<Partial<Record<LeadTabKey, number>>>(() => ({
  new: leadsWorkspace.value.summary.new,
  qualified: leadsWorkspace.value.summary.qualified,
  'follow-up': leadsWorkspace.value.summary.followUp,
  won: leadsWorkspace.value.summary.won,
  lost: leadsWorkspace.value.summary.lost,
  all: leadsWorkspace.value.summary.total,
  archived: leadsWorkspace.value.summary.archived
}))

function buildTabItem(key: LeadTabKey): LeadTabItem {
  const count = tabCounts.value[key]

  return {
    key,
    label: t(`dashboard.leads.filters.${getLeadTabI18nKey(key)}`),
    count: count && count > 0 ? count : undefined
  }
}

const primaryTabs = computed(() => PRIMARY_LEAD_TABS.map(buildTabItem))
const secondaryTabs = computed(() => SECONDARY_LEAD_TABS.map(buildTabItem))

watch(
  () => [route.query.tab, route.query.lead] as const,
  ([, leadId]) => {
    selectedLeadId.value = typeof leadId === 'string' ? leadId : undefined
  },
  { immediate: true }
)

watch(
  () => leadsWorkspace.value.leads,
  (currentLeads) => {
    if (currentLeads.length || route.query.lead) {
      return
    }

    selectedLeadId.value = undefined
  }
)

watch(leadsLoadError, (error) => {
  if (!error) {
    return
  }

  if (import.meta.dev) {
    console.error('[dashboard:leads:load-error]', error)
  }

  toast.add({
    title: t('dashboard.leads.errors.loadFailed'),
    color: 'error'
  })
})

onMounted(() => {
  if (!import.meta.client) {
    return
  }

  const mediaQuery = window.matchMedia('(max-width: 1023px)')

  const syncDrawerViewport = () => {
    canUseLeadDrawer.value = mediaQuery.matches

    if (mediaQuery.matches) {
      isLeadDrawerOpen.value = Boolean(selectedLeadId.value)
    } else {
      isLeadDrawerOpen.value = false
    }
  }

  syncDrawerViewport()
  mediaQuery.addEventListener('change', syncDrawerViewport)

  onBeforeUnmount(() => {
    mediaQuery.removeEventListener('change', syncDrawerViewport)
  })
})

watch(isLeadDrawerOpen, (open) => {
  if (!open && canUseLeadDrawer.value && selectedLeadId.value) {
    closeLeadDetail()
  }
})

function selectTab(tab: LeadTabKey) {
  const { lead, ...restQuery } = route.query

  navigateTo(
    {
      path: route.path,
      query: {
        ...restQuery,
        tab
      }
    },
    { replace: false }
  )
}

function selectLead(id: string) {
  selectedLeadId.value = id

  if (canUseLeadDrawer.value) {
    isLeadDrawerOpen.value = true
  }

  navigateTo(
    {
      path: route.path,
      query: {
        ...route.query,
        tab: activeTab.value,
        lead: id
      }
    },
    { replace: false }
  )
}

function closeLeadDetail() {
  selectedLeadId.value = undefined
  isLeadDrawerOpen.value = false

  const { lead, ...restQuery } = route.query

  navigateTo(
    {
      path: route.path,
      query: restQuery
    },
    { replace: true }
  )
}

function openInboxConversation() {
  if (!selectedLead.value) return

  navigateTo({
    path: '/dashboard/inbox',
    query: {
      tab: 'leads',
      message: selectedLead.value.inboxMessageId
    }
  })
}

async function loadLeads() {
  await withDashboardRefresh(isRefreshing, () => refreshLeads())
}

async function runLeadMutation(task: () => Promise<unknown>) {
  isMutating.value = true

  try {
    await task()
    await refreshLeads()
  } catch {
    toast.add({
      title: t('dashboard.leads.errors.updateFailed'),
      color: 'error'
    })
  } finally {
    isMutating.value = false
  }
}

function handleUpdateStatus(status: LeadStatus) {
  if (!selectedLead.value) return

  runLeadMutation(() => updateLeadStatus(selectedLead.value!.id, status))
}

function handleUpdatePriority(priority: LeadPriority) {
  if (!selectedLead.value) return

  runLeadMutation(() => updateLeadPriority(selectedLead.value!.id, priority))
}

function handleUpdateFollowUp(nextFollowUpAt: string | null) {
  if (!selectedLead.value) return

  runLeadMutation(() => updateLeadFollowUp(selectedLead.value!.id, nextFollowUpAt))
}

function handleUpdateNotes(notes: string | null) {
  if (!selectedLead.value) return

  runLeadMutation(() => updateLeadNotes(selectedLead.value!.id, notes))
}
</script>

<template>
  <div>
    <DashboardWorkspacePage
      :title="t('dashboard.leads.title')"
      :description="t('dashboard.leads.description')"
      grid-class="lg:grid-cols-[minmax(500px,580px)_minmax(0,1fr)]"
    >
      <template #actions>
        <UButton
          color="neutral"
          variant="ghost"
          size="sm"
          :disabled="isRefreshing"
          @click="loadLeads"
        >
          <template #leading>
            <UIcon
              :name="isRefreshing ? 'i-lucide-loader-circle' : 'i-lucide-refresh-cw'"
              class="size-4"
              :class="{ 'animate-spin': isRefreshing }"
            />
          </template>
          {{ t('dashboard.leads.refresh') }}
        </UButton>

        <UButton color="neutral" variant="soft" icon="i-lucide-plus" disabled>
          {{ t('dashboard.leads.addManualLead') }}
        </UButton>
      </template>

      <DashboardLeadsList
        :primary-tabs="primaryTabs"
        :secondary-tabs="secondaryTabs"
        :active-tab="activeTab"
        :leads="leads"
        :search="search"
        :loading="isInitialLeadsLoading"
        :selected-lead-id="selectedLeadId"
        @update:search="search = $event"
        @select-tab="selectTab"
        @select-lead="selectLead"
      />

      <DashboardLeadsLeadDetail
        :lead="selectedLead"
        :loading="isLeadDetailLoading"
        :mutating="isMutating"
        @open-conversation="openInboxConversation"
        @update-status="handleUpdateStatus"
        @update-priority="handleUpdatePriority"
        @update-follow-up="handleUpdateFollowUp"
        @update-notes="handleUpdateNotes"
      />
    </DashboardWorkspacePage>

    <DashboardLeadsLeadDrawer
      v-if="canUseLeadDrawer"
      v-model:open="isLeadDrawerOpen"
      :lead="selectedLead"
      :loading="isLeadDetailLoading"
      :mutating="isMutating"
      @close="closeLeadDetail"
      @open-conversation="openInboxConversation"
      @update-status="handleUpdateStatus"
      @update-priority="handleUpdatePriority"
      @update-follow-up="handleUpdateFollowUp"
      @update-notes="handleUpdateNotes"
    />
  </div>
</template>
