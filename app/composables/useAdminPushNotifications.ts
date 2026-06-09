import type { PushSubscriptionInput } from '~~/shared/contracts/push'

function base64UrlToUint8Array(value: string) {
  const padding = '='.repeat((4 - (value.length % 4)) % 4)
  const base64 = `${value}${padding}`.replace(/-/g, '+').replace(/_/g, '/')
  const raw = window.atob(base64)
  const output = new Uint8Array(raw.length)

  for (let index = 0; index < raw.length; index += 1) {
    output[index] = raw.charCodeAt(index)
  }

  return output
}

function arrayBufferEquals(left: ArrayBuffer | null, right: Uint8Array) {
  if (!left || left.byteLength !== right.byteLength) {
    return false
  }

  const leftBytes = new Uint8Array(left)

  return leftBytes.every((byte, index) => byte === right[index])
}

function getPermission() {
  return import.meta.client && 'Notification' in window ? Notification.permission : 'default'
}

export function useAdminPushNotifications() {
  const permission = ref<NotificationPermission>(getPermission())
  const isSupported = computed(() => {
    return (
      import.meta.client &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    )
  })

  async function requestPush<T>(url: string, body?: unknown) {
    const auth = useAuth()
    const token = auth.restoreToken()

    return $fetch<T>(url, {
      method: body ? 'POST' : 'GET',
      headers: token
        ? {
            Authorization: `Bearer ${token}`
          }
        : undefined,
      body: body as Record<string, unknown> | undefined
    })
  }

  function refreshPermission() {
    permission.value = getPermission()

    return permission.value
  }

  async function registerWithServer(subscription: PushSubscription, deviceLabel?: string) {
    await requestPush('/api/push/subscribe', {
      subscription: subscription.toJSON() as PushSubscriptionInput,
      deviceLabel
    })
  }

  async function ensureSubscribed(deviceLabel?: string) {
    if (!isSupported.value) {
      throw new Error('Push notifications are not supported')
    }

    if (refreshPermission() !== 'granted') {
      throw new Error('Push notification permission was not granted')
    }

    const registration = await navigator.serviceWorker.ready
    const { publicKey } = await requestPush<{ publicKey: string }>('/api/push/public-key')
    const applicationServerKey = base64UrlToUint8Array(publicKey)
    const existingSubscription = await registration.pushManager.getSubscription()
    const existingKey = existingSubscription?.options.applicationServerKey || null

    if (existingSubscription && arrayBufferEquals(existingKey, applicationServerKey)) {
      await registerWithServer(existingSubscription, deviceLabel)

      return existingSubscription
    }

    if (existingSubscription) {
      await existingSubscription.unsubscribe()
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey
    })

    await registerWithServer(subscription, deviceLabel)

    return subscription
  }

  async function subscribe(deviceLabel?: string) {
    if (!isSupported.value) {
      throw new Error('Push notifications are not supported')
    }

    permission.value = await Notification.requestPermission()

    return ensureSubscribed(deviceLabel)
  }

  async function unsubscribe() {
    if (!isSupported.value) {
      return false
    }

    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()

    if (!subscription) {
      return false
    }

    await requestPush('/api/push/unsubscribe', {
      endpoint: subscription.endpoint
    })

    return subscription.unsubscribe()
  }

  return {
    isSupported,
    permission,
    refreshPermission,
    ensureSubscribed,
    subscribe,
    unsubscribe
  }
}
