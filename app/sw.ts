/// <reference lib="webworker" />

import type { AdminPushPayload } from '../shared/contracts/notifications'

declare const self: ServiceWorkerGlobalScope

type NotificationActionOption = {
  action: string
  title: string
  icon?: string
}

type PersistentNotificationOptions = NotificationOptions & {
  actions?: NotificationActionOption[]
  requireInteraction?: boolean
  renotify?: boolean
  timestamp?: number
}

const notificationActions: NotificationActionOption[] = [
  {
    action: 'open',
    title: 'Open inbox'
  },
  {
    action: 'dismiss',
    title: 'Dismiss'
  }
]

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

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('push', (event) => {
  const payload = parsePayload(event.data)
  const url = payload.url || '/dashboard/inbox'
  const options: PersistentNotificationOptions = {
    body: payload.body || 'New notification',
    icon: '/icons/android-chrome-192x192.png',
    badge: '/icons/android-chrome-192x192.png',
    actions: notificationActions,
    requireInteraction: true,
    renotify: true,
    tag: payload.notificationId || payload.entityId || 'mohetios-notification',
    timestamp: Date.now(),
    data: {
      url,
      notificationId: payload.notificationId,
      entityId: payload.entityId
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title || 'Mohetios.dev', options)
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'dismiss') {
    return
  }

  const targetUrl = new URL(
    event.notification.data?.url || '/dashboard/inbox',
    self.location.origin
  ).href

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async (clients) => {
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
    })
  )
})

export {}
