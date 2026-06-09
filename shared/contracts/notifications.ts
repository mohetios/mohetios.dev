export type AdminNotificationType =
  | 'NEW_INBOUND_EMAIL'
  | 'NEW_CONTACT_MESSAGE'
  | 'NEW_COMMENT'
  | 'UNREAD_INBOX_REMINDER'

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
  | {
      type: 'NEW_COMMENT'
      commentId: string
      notificationId: string
    }

export type AdminPushPayload = {
  type: AdminNotificationType
  title: string
  body: string
  url: string
  notificationId: string
  entityId: string
}
