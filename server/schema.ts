export const typeDefs = /* GraphQL */ `
  type Query {
    me: User
  }

  type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    logout: Boolean!
  }

  type User {
    id: ID!
    username: String!
    role: UserRole!
    createdAt: String!
  }

  enum UserRole {
    ADMIN
    USER
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input RegisterInput {
    username: String!
    password: String!
  }

  input LoginInput {
    username: String!
    password: String!
  }
`
