import { createYoga } from 'graphql-yoga'
import { defineEventHandler, sendWebResponse, toWebRequest } from 'h3'
import type { H3Event } from 'h3'

import { createGraphqlContext } from '../graphql/context'
import { schema } from '../graphql/schema'

const yoga = createYoga<{ event: H3Event }>({
  schema,
  graphqlEndpoint: '/api/graphql',
  graphiql: process.env.NODE_ENV !== 'production',
  maskedErrors: process.env.NODE_ENV === 'production',
  landingPage: false,
  context: ({ event }) => createGraphqlContext(event)
})

export default defineEventHandler(async (event) => {
  const response = await yoga.handle(toWebRequest(event), { event })

  return sendWebResponse(event, response)
})
