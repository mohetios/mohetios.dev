import { createError, defineEventHandler, readBody } from 'h3'

import type { PushInboxAction } from '../../../shared/contracts/push'
import { markMessageStatus } from '../../services/inbox/mark-message-status'
import { requireOwnerPushContext } from '../../utils/push-auth'

const validActions = new Set<PushInboxAction>(['read', 'spam'])

function normalizeAction(value: unknown): PushInboxAction {
  if (value !== 'read' && value !== 'spam') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid inbox action'
    })
  }

  return value
}

function normalizeMessageId(value: unknown) {
  const id = typeof value === 'string' ? value.trim() : ''

  if (!id || id.length > 128) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid inbox message id'
    })
  }

  return id
}

export default defineEventHandler(async (event) => {
  const { db } = await requireOwnerPushContext(event)
  const body = await readBody<{
    id?: unknown
    action?: unknown
  }>(event)
  const action = normalizeAction(body.action)

  if (!validActions.has(action)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid inbox action'
    })
  }

  const message = await markMessageStatus(
    db,
    normalizeMessageId(body.id),
    action === 'read' ? 'OPEN' : 'SPAM'
  )

  if (!message) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Inbox message not found'
    })
  }

  return {
    ok: true,
    id: message.id,
    status: message.status
  }
})
