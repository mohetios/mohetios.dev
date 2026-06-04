type GraphqlResponse<T> = {
  data?: T
  errors?: Array<{ message?: string }>
}

export type InboxWorkspaceFilter = 'ALL' | 'NEEDS_REPLY' | 'LEAD' | 'REPLIED' | 'ARCHIVED' | 'SPAM'

export type InboxWorkspaceStatus = 'NEW' | 'OPEN' | 'REPLIED' | 'ARCHIVED' | 'SPAM'

export type InboxWorkspaceKind = 'LEAD' | 'COLLABORATION' | 'PERSONAL' | 'SUPPORT' | 'OTHER' | 'SPAM'

export type InboxMessageDto = {
  id: string
  source: 'CONTACT_FORM' | 'EMAIL'
  status: InboxWorkspaceStatus
  kind: InboxWorkspaceKind
  priority: 'LOW' | 'NORMAL' | 'HIGH'
  senderName: string
  senderEmail: string
  senderCompany?: string | null
  senderWebsite?: string | null
  subject: string
  preview: string
  bodyText: string
  bodyHtml?: string | null
  rawMessageId?: string | null
  inReplyTo?: string | null
  threadKey: string
  createdAt: number
  updatedAt: number
  lastActivityAt: number
}

export type InboxReplyDto = {
  id: string
  inboxMessageId: string
  fromEmail: string
  toEmail: string
  subject: string
  bodyText: string
  providerMessageId?: string | null
  status: 'DRAFT' | 'QUEUED' | 'SENT' | 'FAILED'
  error?: string | null
  createdAt: number
  sentAt?: number | null
}

export type InboxThreadEventDto = {
  id: string
  type: string
  authorName: string
  authorEmail?: string | null
  bodyText: string
  createdAt: number
  isPrivate: boolean
  deliveryStatus: string
}

export type InboxWorkspace = {
  summary: {
    unread: number
    needsReply: number
    leads: number
    archived: number
    spam: number
    total: number
  }
  messages: InboxMessageDto[]
  selectedMessage?: InboxMessageDto | null
  replies: InboxReplyDto[]
  threadEvents: InboxThreadEventDto[]
}

type InboxWorkspaceQuery = {
  inboxWorkspace: InboxWorkspace
}

type UpdateInboxMessageStatusMutation = {
  updateInboxMessageStatus: InboxMessageDto
}

type UpdateInboxMessageKindMutation = {
  updateInboxMessageKind: InboxMessageDto
}

type ReplyToInboxMessageMutation = {
  replyToInboxMessage: {
    id: string
    status: 'DRAFT' | 'QUEUED' | 'SENT' | 'FAILED'
    error?: string | null
  }
}

async function requestInboxGraphql<T>(
  query: string,
  variables: Record<string, unknown> = {}
) {
  const auth = useAuth()
  const token = auth.restoreToken()

  const response = await $fetch<GraphqlResponse<T>>('/graph', {
    method: 'POST',
    headers: token
      ? {
          Authorization: `Bearer ${token}`
        }
      : undefined,
    body: {
      query,
      variables
    }
  })

  if (response.errors?.length) {
    throw new Error(response.errors[0]?.message || 'GraphQL request failed')
  }

  if (!response.data) {
    throw new Error('GraphQL request failed')
  }

  return response.data
}

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
  const variables = computed(() => ({
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
      const result = await requestInboxGraphql<InboxWorkspaceQuery>(
        `
          query InboxWorkspace($input: InboxWorkspaceInput) {
            inboxWorkspace(input: $input) {
              summary {
                unread
                needsReply
                leads
                archived
                spam
                total
              }

              messages {
                id
                source
                status
                kind
                priority
                senderName
                senderEmail
                senderCompany
                senderWebsite
                subject
                preview
                bodyText
                bodyHtml
                rawMessageId
                inReplyTo
                threadKey
                createdAt
                updatedAt
                lastActivityAt
              }

              selectedMessage {
                id
                source
                status
                kind
                priority
                senderName
                senderEmail
                senderCompany
                senderWebsite
                subject
                preview
                bodyText
                bodyHtml
                rawMessageId
                inReplyTo
                threadKey
                createdAt
                updatedAt
                lastActivityAt
              }

              replies {
                id
                inboxMessageId
                fromEmail
                toEmail
                subject
                bodyText
                providerMessageId
                status
                error
                createdAt
                sentAt
              }

              threadEvents {
                id
                type
                authorName
                authorEmail
                bodyText
                createdAt
                isPrivate
                deliveryStatus
              }
            }
          }
        `,
        variables.value
      )

      return result.inboxWorkspace
    },
    {
      default: createDefaultInboxWorkspace,
      watch: [variables]
    }
  )

  async function updateStatus(id: string, status: InboxWorkspaceStatus) {
    const result = await requestInboxGraphql<UpdateInboxMessageStatusMutation>(
      `
        mutation UpdateInboxMessageStatus($input: UpdateInboxMessageStatusInput!) {
          updateInboxMessageStatus(input: $input) {
            id
            source
            status
            kind
            priority
            senderName
            senderEmail
            senderCompany
            senderWebsite
            subject
            preview
            bodyText
            bodyHtml
            rawMessageId
            inReplyTo
            threadKey
            createdAt
            updatedAt
            lastActivityAt
          }
        }
      `,
      {
        input: {
          id,
          status
        }
      }
    )

    await asyncData.refresh()

    return result.updateInboxMessageStatus
  }

  async function updateKind(id: string, kind: InboxWorkspaceKind) {
    const result = await requestInboxGraphql<UpdateInboxMessageKindMutation>(
      `
        mutation UpdateInboxMessageKind($input: UpdateInboxMessageKindInput!) {
          updateInboxMessageKind(input: $input) {
            id
            source
            status
            kind
            priority
            senderName
            senderEmail
            senderCompany
            senderWebsite
            subject
            preview
            bodyText
            bodyHtml
            rawMessageId
            inReplyTo
            threadKey
            createdAt
            updatedAt
            lastActivityAt
          }
        }
      `,
      {
        input: {
          id,
          kind
        }
      }
    )

    await asyncData.refresh()

    return result.updateInboxMessageKind
  }

  async function sendReply(inboxMessageId: string, bodyText: string) {
    const result = await requestInboxGraphql<ReplyToInboxMessageMutation>(
      `
        mutation ReplyToInboxMessage($input: ReplyToInboxMessageInput!) {
          replyToInboxMessage(input: $input) {
            id
            status
            error
          }
        }
      `,
      {
        input: {
          inboxMessageId,
          bodyText
        }
      }
    )

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
