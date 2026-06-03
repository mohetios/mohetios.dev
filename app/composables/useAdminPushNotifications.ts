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

export function useAdminPushNotifications() {
  const permission = ref<NotificationPermission>(
    import.meta.client && 'Notification' in window ? Notification.permission : 'default'
  )
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

  async function subscribe(deviceLabel?: string) {
    if (!isSupported.value) {
      throw new Error('Push notifications are not supported')
    }

    permission.value = await Notification.requestPermission()

    if (permission.value !== 'granted') {
      throw new Error('Push notification permission was not granted')
    }

    const registration = await navigator.serviceWorker.ready
    const { publicKey } = await requestPush<{ publicKey: string }>('/api/push/public-key')
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64UrlToUint8Array(publicKey)
    })

    await requestPush('/api/push/subscribe', {
      subscription: subscription.toJSON() as PushSubscriptionInput,
      deviceLabel
    })

    return subscription
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

  async function sendTestNotification() {
    return requestPush('/api/push/test', {})
  }

  return {
    isSupported,
    permission,
    subscribe,
    unsubscribe,
    sendTestNotification
  }
}
