export const typeDefs = /* GraphQL */ `
  type Query {
    authSetupAvailable: Boolean!
    me: User
    inboxWorkspace(input: InboxWorkspaceInput): InboxWorkspace!
    leadsWorkspace(input: LeadsWorkspaceInput): LeadsWorkspace!
    dashboardHome(range: AnalyticsRange = LAST_7_DAYS): DashboardHome!
    dashboardNavCounts: DashboardNavCounts!
    analyticsDashboard(range: AnalyticsRange!): AnalyticsDashboard!
    newsletterSubscribers(input: NewsletterSubscribersFilterInput): NewsletterSubscribersConnection!
    publicComments(targetType: CommentTargetType!, targetPath: String!): [PublicComment!]!
    adminComments(
      status: CommentStatus
      targetPath: String
      search: String
      limit: Int
      offset: Int
    ): AdminCommentConnection!
  }

  type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    logout: Boolean!
    createContactMessage(input: CreateContactMessageInput!): InboxMessage!
    subscribeToNewsletter(input: SubscribeToNewsletterInput!): SubscribeToNewsletterPayload!
    updateInboxMessageStatus(input: UpdateInboxMessageStatusInput!): InboxMessage!
    updateInboxMessageKind(input: UpdateInboxMessageKindInput!): InboxMessage!
    replyToInboxMessage(input: ReplyToInboxMessageInput!): ReplyToInboxMessageResult!
    trashInboxMessage(id: ID!): InboxMessage!
    restoreInboxMessage(id: ID!): InboxMessage!
    deleteInboxMessageForever(id: ID!): DeleteInboxMessagePayload!
    updateLeadStatus(id: ID!, status: LeadStatus!): LeadItem!
    updateLeadPriority(id: ID!, priority: LeadPriority): LeadItem!
    updateLeadFollowUp(id: ID!, nextFollowUpAt: String): LeadItem!
    updateLeadNotes(id: ID!, notes: String): LeadItem!
    createComment(input: CreateCommentInput!): CreateCommentPayload!
    approveComment(id: ID!): AdminComment!
    markCommentSpam(id: ID!, reason: String): AdminComment!
    deleteComment(id: ID!): AdminComment!
    updateComment(id: ID!, body: String!): AdminComment!
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
    turnstileToken: String!
  }

  input LoginInput {
    username: String!
    password: String!
    turnstileToken: String!
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
    trashedAt: Float
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
    TRASH
  }

  type InboxSummary {
    unread: Int!
    needsReply: Int!
    leads: Int!
    archived: Int!
    spam: Int!
    trash: Int!
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

  type DeleteInboxMessagePayload {
    id: ID!
    deleted: Boolean!
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
    unreadOnly: Boolean = false
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

  enum LeadFilter {
    NEW
    QUALIFIED
    FOLLOW_UP
    WON
    LOST
    ALL
    ARCHIVED
    HIGH_PRIORITY
    NO_FOLLOW_UP
  }

  enum LeadStatus {
    NEW
    QUALIFIED
    FOLLOW_UP
    WON
    LOST
    ARCHIVED
  }

  enum LeadPriority {
    LOW
    MEDIUM
    HIGH
  }

  type LeadSummary {
    total: Int!
    new: Int!
    qualified: Int!
    followUp: Int!
    won: Int!
    lost: Int!
    archived: Int!
  }

  type LeadItem {
    id: ID!
    inboxMessageId: ID!
    source: InboxSource!
    status: LeadStatus!
    priority: LeadPriority!
    name: String!
    email: String!
    company: String
    subject: String!
    summary: String!
    lastActivityAt: Float!
    createdAt: Float!
    nextFollowUpAt: Float
    notes: String
  }

  type LeadsWorkspace {
    summary: LeadSummary!
    leads: [LeadItem!]!
    selectedLead: LeadItem
  }

  input LeadsWorkspaceInput {
    filter: LeadFilter = NEW
    search: String
    selectedLeadId: ID
    limit: Int = 50
    offset: Int = 0
  }

  type DashboardSummary {
    inboxUnread: Int!
    needsReply: Int!
    leads: Int!
    newsletterSubscribers: Int!
    pendingComments: Int!
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
    readerSignals: [DashboardReaderSignal!]!
    systemHealth: [DashboardSystemHealthItem!]!
    recentActivity: [DashboardActivityItem!]!
    quickLinks: [DashboardQuickLink!]!
  }

  type DashboardNavCounts {
    inboxUnread: Int!
    pendingComments: Int!
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
    trend: String
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
    loadTimeTrend: String
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

  enum NewsletterSubscriberStatus {
    PENDING
    SUBSCRIBED
    UNSUBSCRIBED
    BOUNCED
    COMPLAINED
  }

  type NewsletterSubscriber {
    id: ID!
    email: String!
    name: String
    status: NewsletterSubscriberStatus!
    source: String
    locale: String
    consentText: String!
    consentVersion: String!
    consentAt: Float!
    confirmedAt: Float
    unsubscribedAt: Float
    lastEmailSentAt: Float
    createdAt: Float!
    updatedAt: Float!
  }

  input SubscribeToNewsletterInput {
    email: String!
    name: String
    source: String
    locale: String
    turnstileToken: String!
    consentAccepted: Boolean!
    consentText: String!
  }

  type SubscribeToNewsletterPayload {
    ok: Boolean!
    status: NewsletterSubscriberStatus!
    message: String!
    subscriber: NewsletterSubscriber
  }

  input NewsletterSubscribersFilterInput {
    status: NewsletterSubscriberStatus
    search: String
    limit: Int
    offset: Int
  }

  type NewsletterSubscribersSummary {
    total: Int!
    subscribed: Int!
    pending: Int!
    unsubscribed: Int!
  }

  type NewsletterSubscribersConnection {
    items: [NewsletterSubscriber!]!
    total: Int!
    limit: Int!
    offset: Int!
    summary: NewsletterSubscribersSummary!
  }

  enum CommentTargetType {
    BLOG_POST
    LAB_NOTE
    PROJECT
  }

  enum CommentStatus {
    PENDING
    APPROVED
    SPAM
    DELETED
  }

  type PublicComment {
    id: ID!
    targetPath: String!
    parentId: ID
    depth: Int!
    authorName: String!
    body: String!
    createdAt: Float!
    replies: [PublicComment!]!
  }

  type AdminComment {
    id: ID!
    targetType: CommentTargetType!
    targetPath: String!
    targetTitle: String!
    parentId: ID
    depth: Int!
    authorName: String!
    authorEmail: String!
    body: String!
    bodyOriginal: String!
    status: CommentStatus!
    statusReason: String
    approvedAt: Float
    approvedBy: ID
    spammedAt: Float
    spammedBy: ID
    deletedAt: Float
    deletedBy: ID
    editedAt: Float
    editedBy: ID
    createdAt: Float!
    updatedAt: Float!
    preview: String!
    parentPreview: String
  }

  type AdminCommentSummary {
    pending: Int!
    approved: Int!
    spam: Int!
    deleted: Int!
  }

  type AdminCommentConnection {
    items: [AdminComment!]!
    total: Int!
    limit: Int!
    offset: Int!
    summary: AdminCommentSummary!
  }

  input CreateCommentInput {
    targetType: CommentTargetType!
    targetPath: String!
    targetTitle: String!
    parentId: ID
    authorName: String!
    authorEmail: String!
    body: String!
    turnstileToken: String!
  }

  type CreateCommentPayload {
    ok: Boolean!
    message: String!
    commentId: ID!
  }
`

export const schema = typeDefs
