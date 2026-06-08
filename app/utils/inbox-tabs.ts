import type { InboxWorkspaceFilter } from '~/composables/useInboxWorkspace'

export type InboxTabKey =
  | 'unread'
  | 'all'
  | 'needs-reply'
  | 'leads'
  | 'replied'
  | 'archived'
  | 'spam'
  | 'trash'

export const inboxTabToFilter: Record<InboxTabKey, InboxWorkspaceFilter> = {
  unread: 'UNREAD',
  all: 'ALL',
  'needs-reply': 'NEEDS_REPLY',
  leads: 'LEAD',
  replied: 'REPLIED',
  archived: 'ARCHIVED',
  spam: 'SPAM',
  trash: 'TRASH'
}

export const PRIMARY_INBOX_TABS: InboxTabKey[] = ['all', 'needs-reply', 'leads']

export const SECONDARY_INBOX_TABS: InboxTabKey[] = ['replied', 'archived', 'spam', 'trash']

const VALID_TABS = new Set<string>(Object.keys(inboxTabToFilter))

export function parseInboxTab(value: unknown): InboxTabKey {
  if (value === 'unread') {
    return 'all'
  }

  if (typeof value === 'string' && VALID_TABS.has(value)) {
    return value as InboxTabKey
  }

  return 'all'
}

export function parseUnreadOnly(unreadQuery: unknown, tabQuery: unknown) {
  if (unreadQuery === '1' || unreadQuery === 'true') {
    return true
  }

  return tabQuery === 'unread'
}

export type InboxTabItem = {
  key: InboxTabKey
  label: string
  count?: number
}

const TAB_I18N_KEY: Record<InboxTabKey, string> = {
  unread: 'unread',
  all: 'all',
  'needs-reply': 'needsReply',
  leads: 'leads',
  replied: 'replied',
  archived: 'archived',
  spam: 'spam',
  trash: 'trash'
}

export function getInboxTabI18nKey(tab: InboxTabKey) {
  return TAB_I18N_KEY[tab]
}
