import type { InboxFilter, InboxKind, InboxStatus, InboxWorkspaceInput, InboxWorkspaceQuery } from '#gql'

export type InboxWorkspaceFilter = InboxFilter
export type InboxWorkspaceStatus = InboxStatus
export type InboxWorkspaceKind = InboxKind

export type InboxWorkspace = InboxWorkspaceQuery['inboxWorkspace']
export type InboxMessageDto = InboxWorkspace['messages'][number]
export type InboxReplyDto = InboxWorkspace['replies'][number]
export type InboxThreadEventDto = InboxWorkspace['threadEvents'][number]

function createDefaultInboxWorkspace(): InboxWorkspace {
  return {
    summary: {
      unread: 0,
      needsReply: 0,
      leads: 0,
      archived: 0,
      spam: 0,
      total: 0
    },
    messages: [],
    selectedMessage: null,
    replies: [],
    threadEvents: []
  }
}

export function useInboxWorkspace(input: {
  filter: Ref<InboxWorkspaceFilter>
  search: Ref<string>
  selectedMessageId: Ref<string | undefined>
}) {
  const auth = useAuth()
  auth.restoreToken()

  const variables = computed<{ input: InboxWorkspaceInput }>(() => ({
    input: {
      filter: input.filter.value,
      search: input.search.value || null,
      selectedMessageId: input.selectedMessageId.value || null,
      limit: 50,
      offset: 0
    }
  }))

  const asyncData = useAsyncData<InboxWorkspace>(
    () =>
      `dashboard:inbox:${input.filter.value}:${input.search.value}:${input.selectedMessageId.value || 'none'}`,
    async () => {
      const result = await GqlInboxWorkspace(variables.value)
      return result.inboxWorkspace
    },
    {
      default: createDefaultInboxWorkspace,
      watch: [variables]
    }
  )

  async function updateStatus(id: string, status: InboxWorkspaceStatus) {
    const result = await GqlUpdateInboxMessageStatus({ input: { id, status } })

    await asyncData.refresh()

    return result.updateInboxMessageStatus
  }

  async function updateKind(id: string, kind: InboxWorkspaceKind) {
    const result = await GqlUpdateInboxMessageKind({ input: { id, kind } })

    await asyncData.refresh()

    return result.updateInboxMessageKind
  }

  async function sendReply(inboxMessageId: string, bodyText: string) {
    const result = await GqlReplyToInboxMessage({ input: { inboxMessageId, bodyText } })

    await asyncData.refresh()

    return result.replyToInboxMessage
  }

  return {
    data: asyncData.data,
    pending: asyncData.pending,
    error: asyncData.error,
    refresh: asyncData.refresh,
    status: asyncData.status,
    updateStatus,
    updateKind,
    sendReply
  }
}
