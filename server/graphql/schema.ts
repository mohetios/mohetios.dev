import { makeExecutableSchema } from '@graphql-tools/schema'

import { resolvers } from './resolvers'

export const typeDefs = /* GraphQL */ `
  enum UserRole {
    ADMIN
    USER
  }

  type User {
    id: ID!
    email: String!
    name: String
    role: UserRole!
    createdAt: String!
    updatedAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input RegisterInput {
    email: String!
    password: String!
    name: String
  }

  input LoginInput {
    email: String!
    password: String!
  }

  type Query {
    me: User
  }

  type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    logout: Boolean!
  }
`

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers
})
