export const typeDefs = /* GraphQL */ `
  type Query {
    me: User
    memberProfile: User
    inboxMessages: [InboxMessage!]!
  }

  type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    logout: Boolean!
    updateMyProfile(input: UpdateProfileInput!): User!
    createContactMessage(input: CreateContactMessageInput!): InboxMessage!
    updateInboxMessageStatus(id: ID!, status: InboxStatus!): InboxMessage!
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
    channel: InboxChannel!
    status: InboxStatus!
    category: InboxCategory!
    fromName: String!
    fromEmail: String!
    subject: String!
    preview: String!
    body: String!
    topic: String
    company: String
    website: String
    source: String
    createdAt: String!
    updatedAt: String!
  }

  enum InboxChannel {
    CONTACT_FORM
    EMAIL
    SYSTEM
    MANUAL
  }

  enum InboxStatus {
    UNREAD
    READ
    ARCHIVED
    SPAM
  }

  enum InboxCategory {
    LEAD
    JOB
    FREELANCE
    GENERAL
    SYSTEM
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
`

export const schema = typeDefs
