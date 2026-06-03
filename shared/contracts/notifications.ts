export type AdminNotificationJob =
  | {
      type: 'NEW_INBOUND_EMAIL'
      inboxMessageId: string
      notificationId: string
    }
  | {
      type: 'NEW_CONTACT_MESSAGE'
      inboxMessageId: string
      notificationId: string
    }

export type AdminPushPayload = {
  type: AdminNotificationJob['type']
  title: string
  body: string
  url: string
  notificationId: string
  entityId: string
}
