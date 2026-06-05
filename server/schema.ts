export const typeDefs = /* GraphQL */ `
  type Query {
    me: User
    memberProfile: User
    inboxWorkspace(input: InboxWorkspaceInput): InboxWorkspace!
    leadWorkspace(input: LeadWorkspaceInput): LeadWorkspace!
    adminNotifications: [AdminNotification!]!
    pushSubscriptions: [PushSubscription!]!
    dashboardHome: DashboardHome!
    analyticsDashboard(range: AnalyticsRange!): AnalyticsDashboard!
  }

  type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    logout: Boolean!
    updateMyProfile(input: UpdateProfileInput!): User!
    createContactMessage(input: CreateContactMessageInput!): InboxMessage!
    updateInboxMessageStatus(input: UpdateInboxMessageStatusInput!): InboxMessage!
    updateInboxMessageKind(input: UpdateInboxMessageKindInput!): InboxMessage!
    replyToInboxMessage(input: ReplyToInboxMessageInput!): ReplyToInboxMessageResult!
    updateLeadReview(input: UpdateLeadReviewInput!): LeadItem!
    markLeadQualified(id: ID!): LeadItem!
    archiveLead(id: ID!): LeadItem!
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

  enum InboxFilter {
    UNREAD
    ALL
    NEEDS_REPLY
    LEAD
    REPLIED
    ARCHIVED
    SPAM
  }

  type InboxSummary {
    unread: Int!
    needsReply: Int!
    leads: Int!
    archived: Int!
    spam: Int!
    total: Int!
  }

  type InboxThreadEvent {
    id: ID!
    type: String!
    authorName: String!
    authorEmail: String
    bodyText: String!
    createdAt: Float!
    isPrivate: Boolean!
    deliveryStatus: String!
  }

  type InboxWorkspace {
    summary: InboxSummary!
    messages: [InboxMessage!]!
    selectedMessage: InboxMessage
    replies: [InboxReply!]!
    threadEvents: [InboxThreadEvent!]!
  }

  type ReplyToInboxMessageResult {
    id: ID!
    status: InboxReplyStatus!
    error: String
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

  input ReplyToInboxMessageInput {
    inboxMessageId: ID!
    bodyText: String!
  }

  input InboxWorkspaceInput {
    filter: InboxFilter = ALL
    search: String
    selectedMessageId: ID
    limit: Int = 50
    offset: Int = 0
  }

  input UpdateInboxMessageStatusInput {
    id: ID!
    status: InboxStatus!
  }

  input UpdateInboxMessageKindInput {
    id: ID!
    kind: InboxKind!
  }

  enum LeadReviewStatusFilter {
    ALL
    NEW
    OPEN
    REPLIED
    ARCHIVED
    SPAM
  }

  enum LeadReviewTypeFilter {
    ALL
    LEAD
    COLLABORATION
    PERSONAL
    SUPPORT
    OTHER
  }

  enum LeadReviewSourceFilter {
    ALL
    EMAIL
    CONTACT_FORM
  }

  enum LeadReviewPriorityFilter {
    ALL
    LOW
    NORMAL
    HIGH
  }

  type LeadSummary {
    total: Int!
    new: Int!
    qualified: Int!
    highPriority: Int!
    archived: Int!
  }

  type LeadItem {
    id: ID!
    title: String!
    summary: String!
    source: InboxSource!
    status: InboxStatus!
    kind: InboxKind!
    priority: InboxPriority!
    name: String!
    email: String!
    company: String
    website: String
    subject: String!
    bodyText: String!
    relatedInboxMessageId: ID!
    relatedInboxThreadId: ID!
    threadKey: String!
    createdAt: Float!
    updatedAt: Float!
    lastActivityAt: Float!
    lastContactedAt: Float
    tags: [String!]!
  }

  type LeadWorkspace {
    summary: LeadSummary!
    leads: [LeadItem!]!
    selectedLead: LeadItem
  }

  input LeadWorkspaceInput {
    status: LeadReviewStatusFilter = ALL
    type: LeadReviewTypeFilter = ALL
    source: LeadReviewSourceFilter = ALL
    priority: LeadReviewPriorityFilter = ALL
    search: String
    selectedLeadId: ID
    limit: Int = 50
    offset: Int = 0
  }

  input UpdateLeadReviewInput {
    id: ID!
    status: InboxStatus
    kind: InboxKind
    priority: InboxPriority
  }

  type DashboardSummary {
    inboxUnread: Int!
    needsReply: Int!
    leads: Int!
    visits: Int!
    pageViews: Int!
    searchClicks: Int!
    avgLoadMs: Int!
  }

  type DashboardAudiencePoint {
    date: String!
    visitors: Int!
    pageViews: Int!
  }

  type DashboardInboxPreviewItem {
    id: ID!
    source: String!
    status: String!
    kind: String!
    senderName: String!
    senderEmail: String!
    subject: String!
    preview: String!
    createdAt: Float!
  }

  type DashboardContentItem {
    id: ID!
    title: String!
    slug: String!
    section: String!
    status: String!
    updatedAt: Float!
  }

  type DashboardContentPulse {
    publishedCount: Int!
    draftCount: Int!
    latestItems: [DashboardContentItem!]!
  }

  type DashboardReaderSignal {
    label: String!
    value: String!
    helper: String!
    icon: String!
  }

  type DashboardSystemHealthItem {
    key: String!
    label: String!
    status: String!
    helper: String!
  }

  type DashboardActivityItem {
    id: ID!
    type: String!
    title: String!
    description: String!
    createdAt: Float!
    href: String
  }

  type DashboardQuickLink {
    key: String!
    label: String!
    description: String!
    icon: String!
    to: String!
  }

  type DashboardHome {
    summary: DashboardSummary!
    audienceTrend: [DashboardAudiencePoint!]!
    inboxPreview: [DashboardInboxPreviewItem!]!
    contentPulse: DashboardContentPulse!
    readerSignals: [DashboardReaderSignal!]!
    systemHealth: [DashboardSystemHealthItem!]!
    recentActivity: [DashboardActivityItem!]!
    quickLinks: [DashboardQuickLink!]!
  }

  enum AnalyticsRange {
    LAST_7_DAYS
    LAST_30_DAYS
    LAST_90_DAYS
  }

  type AnalyticsMetric {
    key: String!
    label: String!
    value: String!
    helper: String!
    icon: String!
    trend: String
  }

  type AnalyticsTrendPoint {
    date: String!
    visitors: Int!
    pageViews: Int!
    searchClicks: Int!
  }

  type AnalyticsTopPage {
    title: String!
    path: String!
    views: Int!
    visitors: Int!
    avgTime: String!
    source: String!
  }

  type AnalyticsReferrer {
    source: String!
    visits: Int!
    share: Int!
    trend: String!
  }

  type AnalyticsCountry {
    code: String!
    country: String!
    visits: Int!
    share: Int!
  }

  type AnalyticsSearchQuery {
    query: String!
    clicks: Int!
    impressions: Int!
    ctr: String!
    position: String!
    page: String!
  }

  type AnalyticsWebVital {
    key: String!
    label: String!
    value: String!
    status: String!
    helper: String!
  }

  type AnalyticsEdgeSummary {
    cacheHitRatio: String!
    edgeRequests: String!
    edgeErrors: String!
    avgLoadTime: String!
    loadTimeTrend: String!
    progressValue: Int!
  }

  type AnalyticsDashboard {
    metrics: [AnalyticsMetric!]!
    trend: [AnalyticsTrendPoint!]!
    topPages: [AnalyticsTopPage!]!
    referrers: [AnalyticsReferrer!]!
    countries: [AnalyticsCountry!]!
    searchQueries: [AnalyticsSearchQuery!]!
    webVitals: [AnalyticsWebVital!]!
    edgeSummary: AnalyticsEdgeSummary!
    dataSourceLabel: String!
    dataSourceDescription: String!
  }
`

export const schema = typeDefs
