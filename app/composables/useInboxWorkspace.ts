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

function updateMessageStatus(
  workspace: InboxWorkspace,
  id: string,
  status: InboxWorkspaceStatus
) {
  const now = Date.now()
  let previousStatus: InboxWorkspaceStatus | null =
    workspace.selectedMessage?.id === id ? workspace.selectedMessage.status : null

  const messages = workspace.messages.map((message) => {
    if (message.id !== id) {
      return message
    }

    previousStatus = message.status

    return {
      ...message,
      status,
      updatedAt: now,
      lastActivityAt: now
    }
  })
  const selectedMessage =
    workspace.selectedMessage?.id === id
      ? {
          ...workspace.selectedMessage,
          status,
          updatedAt: now,
          lastActivityAt: now
        }
      : workspace.selectedMessage

  const unreadDelta =
    previousStatus === 'NEW' && status !== 'NEW'
      ? -1
      : previousStatus !== 'NEW' && status === 'NEW'
        ? 1
        : 0
  const wasNeedsReply = previousStatus ? ['NEW', 'OPEN'].includes(previousStatus) : false
  const isNeedsReply = ['NEW', 'OPEN'].includes(status)
  const needsReplyDelta =
    wasNeedsReply && !isNeedsReply ? -1 : !wasNeedsReply && isNeedsReply ? 1 : 0

  return {
    ...workspace,
    summary: {
      ...workspace.summary,
      unread: Math.max(0, workspace.summary.unread + unreadDelta),
      needsReply: Math.max(0, workspace.summary.needsReply + needsReplyDelta),
      archived:
        previousStatus !== 'ARCHIVED' && status === 'ARCHIVED'
          ? workspace.summary.archived + 1
          : previousStatus === 'ARCHIVED' && status !== 'ARCHIVED'
            ? Math.max(0, workspace.summary.archived - 1)
            : workspace.summary.archived,
      spam:
        previousStatus !== 'SPAM' && status === 'SPAM'
          ? workspace.summary.spam + 1
          : previousStatus === 'SPAM' && status !== 'SPAM'
            ? Math.max(0, workspace.summary.spam - 1)
            : workspace.summary.spam
    },
    messages,
    selectedMessage
  }
}

function updateMessageKind(workspace: InboxWorkspace, id: string, kind: InboxWorkspaceKind) {
  const messages = workspace.messages.map((message) =>
    message.id === id
      ? {
          ...message,
          kind
        }
      : message
  )
  const selectedMessage =
    workspace.selectedMessage?.id === id
      ? {
          ...workspace.selectedMessage,
          kind
        }
      : workspace.selectedMessage

  return {
    ...workspace,
    messages,
    selectedMessage
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
    'dashboard:inbox:workspace',
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

    if (asyncData.data.value) {
      asyncData.data.value = updateMessageStatus(asyncData.data.value, id, status)
    }

    return result.updateInboxMessageStatus
  }

  async function updateKind(id: string, kind: InboxWorkspaceKind) {
    const result = await GqlUpdateInboxMessageKind({ input: { id, kind } })

    if (asyncData.data.value) {
      asyncData.data.value = updateMessageKind(asyncData.data.value, id, kind)
    }

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
