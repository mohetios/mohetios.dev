import type {
  LeadReviewPriorityFilter,
  LeadReviewSourceFilter,
  LeadReviewStatusFilter,
  LeadReviewTypeFilter,
  LeadWorkspaceInput,
  LeadWorkspaceQuery,
  UpdateLeadReviewInput
} from '#gql'

export type {
  LeadReviewPriorityFilter,
  LeadReviewSourceFilter,
  LeadReviewStatusFilter,
  LeadReviewTypeFilter
}

export type LeadWorkspace = LeadWorkspaceQuery['leadWorkspace']
export type LeadItemDto = LeadWorkspace['leads'][number]
type LeadSummary = LeadWorkspace['summary']

function createDefaultLeadWorkspace(): LeadWorkspace {
  return {
    summary: {
      total: 0,
      new: 0,
      qualified: 0,
      highPriority: 0,
      archived: 0
    },
    leads: [],
    selectedLead: null
  }
}

function updateLeadSummary(summary: LeadSummary, previous: LeadItemDto | null, next: LeadItemDto) {
  const statusDelta = (status: LeadItemDto['status']) =>
    previous?.status === status && next.status !== status
      ? -1
      : previous?.status !== status && next.status === status
        ? 1
        : 0
  const highPriorityDelta =
    previous?.priority === 'HIGH' && next.priority !== 'HIGH'
      ? -1
      : previous?.priority !== 'HIGH' && next.priority === 'HIGH'
        ? 1
        : 0
  const wasQualified =
    previous?.kind === 'LEAD' && (previous.status === 'OPEN' || previous.status === 'REPLIED')
  const isQualified = next.kind === 'LEAD' && (next.status === 'OPEN' || next.status === 'REPLIED')
  const qualifiedDelta = wasQualified && !isQualified ? -1 : !wasQualified && isQualified ? 1 : 0

  return {
    ...summary,
    new: Math.max(0, summary.new + statusDelta('NEW')),
    qualified: Math.max(0, summary.qualified + qualifiedDelta),
    highPriority: Math.max(0, summary.highPriority + highPriorityDelta),
    archived: Math.max(0, summary.archived + statusDelta('ARCHIVED'))
  }
}

function replaceLead(workspace: LeadWorkspace, lead: LeadItemDto) {
  let previousLead: LeadItemDto | null =
    workspace.selectedLead?.id === lead.id ? workspace.selectedLead : null
  let found = false
  const leads = workspace.leads.map((item) => {
    if (item.id !== lead.id) {
      return item
    }

    previousLead = item
    found = true
    return lead
  })

  return {
    ...workspace,
    summary: updateLeadSummary(workspace.summary, previousLead, lead),
    leads: found ? leads : workspace.leads,
    selectedLead: workspace.selectedLead?.id === lead.id ? lead : workspace.selectedLead
  }
}

export function useLeadWorkspace(input: {
  status: Ref<LeadReviewStatusFilter>
  type: Ref<LeadReviewTypeFilter>
  source: Ref<LeadReviewSourceFilter>
  priority: Ref<LeadReviewPriorityFilter>
  search: Ref<string>
  selectedLeadId: Ref<string | undefined>
}) {
  const auth = useAuth()
  auth.restoreToken()

  const variables = computed<{ input: LeadWorkspaceInput }>(() => ({
    input: {
      status: input.status.value,
      type: input.type.value,
      source: input.source.value,
      priority: input.priority.value,
      search: input.search.value || null,
      selectedLeadId: input.selectedLeadId.value || null,
      limit: 50,
      offset: 0
    }
  }))

  const asyncData = useAsyncData<LeadWorkspace>(
    'dashboard:leads:workspace',
    async () => {
      const result = await GqlLeadWorkspace(variables.value)
      return result.leadWorkspace
    },
    {
      default: createDefaultLeadWorkspace,
      dedupe: 'defer',
      watch: [variables]
    }
  )

  async function updateLeadReview(inputValue: UpdateLeadReviewInput) {
    const result = await GqlUpdateLeadReview({ input: inputValue })

    if (asyncData.data.value) {
      asyncData.data.value = replaceLead(asyncData.data.value, result.updateLeadReview)
    }

    return result.updateLeadReview
  }

  async function markLeadQualified(id: string) {
    const result = await GqlMarkLeadQualified({ id })

    if (asyncData.data.value) {
      asyncData.data.value = replaceLead(asyncData.data.value, result.markLeadQualified)
    }

    return result.markLeadQualified
  }

  async function archiveLead(id: string) {
    const result = await GqlArchiveLead({ id })

    if (asyncData.data.value) {
      asyncData.data.value = replaceLead(asyncData.data.value, result.archiveLead)
    }

    return result.archiveLead
  }

  return {
    data: asyncData.data,
    pending: asyncData.pending,
    error: asyncData.error,
    refresh: asyncData.refresh,
    status: asyncData.status,
    updateLeadReview,
    markLeadQualified,
    archiveLead
  }
}
