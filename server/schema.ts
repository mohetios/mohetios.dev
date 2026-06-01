export const typeDefs = /* GraphQL */ `
  type Query {
    me: User
    memberProfile: User
  }

  type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    logout: Boolean!
    updateMyProfile(input: UpdateProfileInput!): User!
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
`

export const schema = typeDefs
