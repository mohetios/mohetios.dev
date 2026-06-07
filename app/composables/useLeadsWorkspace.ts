import type { LeadFilter } from '~/utils/lead-tabs'
import type { LeadPriority, LeadStatus, LeadsWorkspaceInput, LeadsWorkspaceQuery } from '#gql'

export type { LeadPriority, LeadStatus }

export type LeadsWorkspace = LeadsWorkspaceQuery['leadsWorkspace']
export type LeadItemDto = LeadsWorkspace['leads'][number]

function createDefaultLeadsWorkspace(): LeadsWorkspace {
  return {
    summary: {
      total: 0,
      new: 0,
      qualified: 0,
      followUp: 0,
      won: 0,
      lost: 0,
      archived: 0
    },
    leads: [],
    selectedLead: null
  }
}

export function useLeadsWorkspace(input: {
  filter: Ref<LeadFilter>
  search: Ref<string>
  selectedLeadId: Ref<string | undefined>
}) {
  const auth = useAuth()
  auth.restoreToken()

  const variables = computed<{ input: LeadsWorkspaceInput }>(() => ({
    input: {
      filter: input.filter.value,
      search: input.search.value || null,
      selectedLeadId: input.selectedLeadId.value || null,
      limit: 50,
      offset: 0
    }
  }))

  const asyncData = useAsyncData<LeadsWorkspace>(
    'dashboard:leads:workspace',
    async () => {
      const result = await GqlLeadsWorkspace(variables.value)
      return result.leadsWorkspace
    },
    {
      default: createDefaultLeadsWorkspace,
      dedupe: 'defer',
      watch: [variables]
    }
  )

  async function updateLeadStatus(id: string, status: LeadStatus) {
    const result = await GqlUpdateLeadStatus({ id, status })
    return result.updateLeadStatus
  }

  async function updateLeadPriority(id: string, priority?: LeadPriority | null) {
    const result = await GqlUpdateLeadPriority({ id, priority: priority || null })
    return result.updateLeadPriority
  }

  async function updateLeadFollowUp(id: string, nextFollowUpAt?: string | null) {
    const result = await GqlUpdateLeadFollowUp({ id, nextFollowUpAt: nextFollowUpAt || null })
    return result.updateLeadFollowUp
  }

  async function updateLeadNotes(id: string, notes?: string | null) {
    const result = await GqlUpdateLeadNotes({ id, notes: notes || null })
    return result.updateLeadNotes
  }

  return {
    data: asyncData.data,
    pending: asyncData.pending,
    error: asyncData.error,
    refresh: asyncData.refresh,
    updateLeadStatus,
    updateLeadPriority,
    updateLeadFollowUp,
    updateLeadNotes
  }
}
