/// <reference lib="webworker" />

import type { AdminPushPayload } from '../shared/contracts/notifications'
import type { PushInboxAction } from '../shared/contracts/push'

declare const self: ServiceWorkerGlobalScope

type NotificationActionOption = {
  action: string
  title: string
  icon?: string
  type?: 'button'
}

type PersistentNotificationOptions = NotificationOptions & {
  actions?: NotificationActionOption[]
  requireInteraction?: boolean
  renotify?: boolean
  timestamp?: number
  vibrate?: number[]
}

type NotificationConstructorWithMaxActions = typeof Notification & {
  maxActions?: number
}

type ServiceWorkerClientMessage =
  | {
      type: 'auth-token'
      token: string | null
    }
  | {
      type: 'clear-auth-token'
    }

let authToken: string | null = null

const notificationActions: NotificationActionOption[] = [
  {
    action: 'view',
    title: 'View',
    type: 'button'
  },
  {
    action: 'read',
    title: 'Read',
    type: 'button'
  },
  {
    action: 'spam',
    title: 'Spam',
    type: 'button'
  }
]

const viewNotificationAction: NotificationActionOption = {
  action: 'view',
  title: 'View',
  type: 'button'
}

function getNotificationActions(payload: AdminPushPayload) {
  const actions =
    payload.entityId && payload.entityId !== 'test'
      ? notificationActions
      : [viewNotificationAction]
  const notificationApi = Notification as NotificationConstructorWithMaxActions
  const maxActions =
    typeof notificationApi.maxActions === 'number' && notificationApi.maxActions >= 0
      ? notificationApi.maxActions
      : actions.length

  return actions.slice(0, maxActions)
}

function fallbackPayload(): AdminPushPayload {
  return {
    type: 'NEW_CONTACT_MESSAGE',
    title: 'Mohetios.dev',
    body: 'New dashboard notification',
    url: '/dashboard/inbox',
    notificationId: '',
    entityId: ''
  }
}

function parsePayload(data: PushMessageData | null): AdminPushPayload {
  if (!data) return fallbackPayload()

  try {
    return data.json() as AdminPushPayload
  } catch {
    return fallbackPayload()
  }
}

function getNotificationData(notification: Notification) {
  const data = notification.data as
    | {
        url?: string
        notificationId?: string
        entityId?: string
      }
    | undefined

  return {
    url: data?.url || '/dashboard/inbox',
    notificationId: data?.notificationId || '',
    entityId: data?.entityId || ''
  }
}

async function broadcastDashboardMessage(message: {
  type: 'inbox-action'
  action: PushInboxAction
  entityId: string
}) {
  const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })

  clients.forEach((client) => {
    client.postMessage(message)
  })
}

async function updateInboxMessageFromNotification(
  action: PushInboxAction,
  messageId: string,
  fallbackUrl: string
) {
  if (!messageId) {
    throw new Error('Inbox message id is missing')
  }

  try {
    const response = await fetch('/api/push/inbox-action', {
      method: 'POST',
      credentials: 'include',
      headers: authToken
        ? {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`
          }
        : {
            'Content-Type': 'application/json'
          },
      body: JSON.stringify({
        id: messageId,
        action
      })
    })

    if (!response.ok) {
      throw new Error(`Inbox push action failed with status ${response.status}`)
    }

    await broadcastDashboardMessage({
      type: 'inbox-action',
      action,
      entityId: messageId
    })
  } catch (error) {
    console.warn('[push:inbox-action-failed]', error)
    await openNotificationTarget(fallbackUrl)
  }
}

async function openNotificationTarget(url: string) {
  const targetUrl = new URL(url || '/dashboard/inbox', self.location.origin).href
  const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
  const exactClient = clients.find((client) => client.url === targetUrl && 'focus' in client)

  if (exactClient) {
    return exactClient.focus()
  }

  const appClient = clients.find((client) => 'focus' in client)

  if (appClient) {
    await appClient.focus()
    return appClient.navigate?.(targetUrl)
  }

  return self.clients.openWindow(targetUrl)
}

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('message', (event) => {
  const message = event.data as ServiceWorkerClientMessage | undefined

  if (message?.type === 'auth-token') {
    authToken = message.token || null
    return
  }

  if (message?.type === 'clear-auth-token') {
    authToken = null
  }
})

self.addEventListener('push', (event) => {
  const payload = parsePayload(event.data)
  const url = payload.url || '/dashboard/inbox'
  const options: PersistentNotificationOptions = {
    body: payload.body || 'New notification',
    icon: '/icons/android-chrome-192x192.png',
    badge: '/icons/android-chrome-192x192.png',
    actions: getNotificationActions(payload),
    requireInteraction: true,
    renotify: true,
    tag: payload.notificationId || payload.entityId || 'mohetios-notification',
    timestamp: Date.now(),
    vibrate: [80, 40, 80],
    data: {
      url,
      notificationId: payload.notificationId,
      entityId: payload.entityId
    }
  }

  event.waitUntil(self.registration.showNotification(payload.title || 'Mohetios.dev', options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const action = event.action || 'view'
  const data = getNotificationData(event.notification)

  if (action === 'read' || action === 'spam') {
    event.waitUntil(updateInboxMessageFromNotification(action, data.entityId, data.url))
    return
  }

  event.waitUntil(openNotificationTarget(data.url))
})

export {}
