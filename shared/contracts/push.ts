export type PushSubscriptionInput = {
  endpoint: string
  expirationTime?: number | null
  keys: {
    p256dh: string
    auth: string
  }
}

export type PushInboxAction = 'read' | 'spam'
