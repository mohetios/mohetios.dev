import { createInboxPreview } from '../utils/inbox-map'

export const inboxFieldResolvers = {
  InboxMessage: {
    preview: (message: { bodyText: string; preview?: string | null }) =>
      message.preview || createInboxPreview(message.bodyText)
  }
}
