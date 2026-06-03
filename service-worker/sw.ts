/// <reference lib="webworker" />

import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'

import type { AdminPushPayload } from '../shared/contracts/notifications'

declare const self: ServiceWorkerGlobalScope

precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

function parsePayload(data: PushMessageData | null): AdminPushPayload {
  if (!data) {
    return fallbackPayload()
  }

  try {
    return data.json() as AdminPushPayload
  } catch {
    return fallbackPayload()
  }
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

self.addEventListener('push', (event) => {
  const payload = parsePayload(event.data)
  const url = payload.url || '/dashboard/inbox'

  event.waitUntil(
    self.registration.showNotification(payload.title || 'Mohetios.dev', {
      body: payload.body || 'New notification',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      data: {
        url,
        notificationId: payload.notificationId,
        entityId: payload.entityId
      }
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const targetUrl = new URL(event.notification.data?.url || '/dashboard/inbox', self.location.origin)
    .href

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async (clients) => {
      for (const client of clients) {
        if ('focus' in client && client.url === targetUrl) {
          return client.focus()
        }
      }

      return self.clients.openWindow(targetUrl)
    })
  )
})
