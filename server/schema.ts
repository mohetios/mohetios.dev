export const typeDefs = /* GraphQL */ `
  type Query {
    me: User
    memberProfile: User
    inboxMessages(filter: InboxMessageFilterInput, pagination: PaginationInput): [InboxMessage!]!
    inboxMessage(id: ID!): InboxMessage
    adminNotifications: [AdminNotification!]!
    pushSubscriptions: [PushSubscription!]!
  }

  type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    logout: Boolean!
    updateMyProfile(input: UpdateProfileInput!): User!
    createContactMessage(input: CreateContactMessageInput!): InboxMessage!
    updateInboxMessageStatus(id: ID!, status: InboxStatus!): InboxMessage!
    replyToInboxMessage(input: ReplyToInboxMessageInput!): InboxReply!
  }

  type User {
    id: ID!
    username: String!
    role: UserRole!
    displayName: String
    bio: String
    website: String
    avatarUrl: String
    createdAt: String!
  }

  enum UserRole {
    OWNER
    MEMBER
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input RegisterInput {
    username: String!
    password: String!
    displayName: String
  }

  input LoginInput {
    username: String!
    password: String!
  }

  input UpdateProfileInput {
    displayName: String
    bio: String
    website: String
    avatarUrl: String
  }

  type InboxMessage {
    id: ID!
    source: InboxSource!
    status: InboxStatus!
    kind: InboxKind!
    priority: InboxPriority!
    senderName: String!
    senderEmail: String!
    senderCompany: String
    senderWebsite: String
    subject: String!
    preview: String!
    bodyText: String!
    bodyHtml: String
    rawMessageId: String
    inReplyTo: String
    threadKey: String!
    replies: [InboxReply!]!
    createdAt: Float!
    updatedAt: Float!
    lastActivityAt: Float!
  }

  type InboxReply {
    id: ID!
    inboxMessageId: ID!
    fromEmail: String!
    toEmail: String!
    subject: String!
    bodyText: String!
    providerMessageId: String
    status: InboxReplyStatus!
    error: String
    createdAt: Float!
    sentAt: Float
  }

  type AdminNotification {
    id: ID!
    type: AdminNotificationType!
    title: String!
    body: String!
    url: String!
    entityType: String!
    entityId: String!
    readAt: Float
    createdAt: Float!
  }

  type PushSubscription {
    id: ID!
    userId: ID!
    endpoint: String!
    userAgent: String
    deviceLabel: String
    createdAt: Float!
    lastUsedAt: Float
    disabledAt: Float
  }

  enum InboxSource {
    CONTACT_FORM
    EMAIL
  }

  enum InboxStatus {
    NEW
    OPEN
    REPLIED
    ARCHIVED
    SPAM
  }

  enum InboxKind {
    LEAD
    COLLABORATION
    PERSONAL
    SUPPORT
    OTHER
    SPAM
  }

  enum InboxPriority {
    LOW
    NORMAL
    HIGH
  }

  enum InboxReplyStatus {
    DRAFT
    QUEUED
    SENT
    FAILED
  }

  enum AdminNotificationType {
    NEW_INBOUND_EMAIL
    NEW_CONTACT_MESSAGE
  }

  input CreateContactMessageInput {
    name: String!
    email: String!
    topic: String!
    message: String!
    turnstileToken: String!
    website: String
    company: String
  }

  input InboxMessageFilterInput {
    status: InboxStatus
    kind: InboxKind
    source: InboxSource
  }

  input PaginationInput {
    limit: Int
    offset: Int
  }

  input ReplyToInboxMessageInput {
    inboxMessageId: ID!
    bodyText: String!
  }
`

export const schema = typeDefs
