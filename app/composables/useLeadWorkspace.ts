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
    () =>
      [
        'dashboard:leads',
        input.status.value,
        input.type.value,
        input.source.value,
        input.priority.value,
        input.search.value,
        input.selectedLeadId.value || 'none'
      ].join(':'),
    async () => {
      const result = await GqlLeadWorkspace(variables.value)
      return result.leadWorkspace
    },
    {
      default: createDefaultLeadWorkspace,
      watch: [variables]
    }
  )

  async function updateLeadReview(inputValue: UpdateLeadReviewInput) {
    const result = await GqlUpdateLeadReview({ input: inputValue })

    await asyncData.refresh()

    return result.updateLeadReview
  }

  async function markLeadQualified(id: string) {
    const result = await GqlMarkLeadQualified({ id })

    await asyncData.refresh()

    return result.markLeadQualified
  }

  async function archiveLead(id: string) {
    const result = await GqlArchiveLead({ id })

    await asyncData.refresh()

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
