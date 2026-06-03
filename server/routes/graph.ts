import { createSchema, createYoga } from 'graphql-yoga'
import { createError, defineEventHandler, sendWebResponse, toWebRequest, type H3Event } from 'h3'

import { Mutation } from '../mutations'
import { getDb } from '../models/client'
import { fieldResolvers, Query } from '../queries'
import { typeDefs } from '../schema'
import { getBearerToken } from '../utils/auth'
import { verifyAuthToken } from '../utils/crypto'
import { getServerEnv } from '../utils/env'
import type { UserRole } from '../../shared/constants/permissions'

export type GraphQLContext = {
  event: H3Event
  env: ReturnType<typeof getServerEnv>
  db: ReturnType<typeof getDb>
  userId?: string
  username?: string
  userRole?: Exclude<UserRole, 'GUEST'>
}

const createGraphQLContext = async (event: H3Event): Promise<GraphQLContext> => {
  const env = getServerEnv(event)
  const db = getDb(event)
  const token = getBearerToken(event)
  const claims = token ? await verifyAuthToken(token, env) : null

  return {
    event,
    env,
    db,
    userId: claims?.sub,
    username: claims?.username,
    userRole: claims?.role
  }
}

const schema = createSchema({
  typeDefs,
  resolvers: {
    Query,
    Mutation,
    ...fieldResolvers
  }
})

const yoga = createYoga<{ event: H3Event }>({
  schema,
  graphqlEndpoint: '/graph',
  graphiql: process.env.NODE_ENV !== 'production',
  landingPage: process.env.NODE_ENV !== 'production',
  maskedErrors: process.env.NODE_ENV === 'production',
  context: ({ event }) => createGraphQLContext(event)
})

export default defineEventHandler(async (event) => {
  const method = event.method?.toUpperCase()

  if (method === 'GET' && process.env.NODE_ENV === 'production') {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found'
    })
  }

  if (method !== 'GET' && method !== 'POST') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method Not Allowed'
    })
  }

  const response = await yoga.fetch(toWebRequest(event), { event })

  return sendWebResponse(event, response)
})
