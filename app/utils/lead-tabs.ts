export type LeadFilter =
  | 'NEW'
  | 'QUALIFIED'
  | 'FOLLOW_UP'
  | 'WON'
  | 'LOST'
  | 'ALL'
  | 'ARCHIVED'
  | 'HIGH_PRIORITY'
  | 'NO_FOLLOW_UP'

export type LeadTabKey =
  | 'new'
  | 'qualified'
  | 'follow-up'
  | 'won'
  | 'lost'
  | 'all'
  | 'archived'
  | 'high-priority'
  | 'no-follow-up'

export const leadTabToFilter: Record<LeadTabKey, LeadFilter> = {
  new: 'NEW',
  qualified: 'QUALIFIED',
  'follow-up': 'FOLLOW_UP',
  won: 'WON',
  lost: 'LOST',
  all: 'ALL',
  archived: 'ARCHIVED',
  'high-priority': 'HIGH_PRIORITY',
  'no-follow-up': 'NO_FOLLOW_UP'
}

export const PRIMARY_LEAD_TABS: LeadTabKey[] = [
  'new',
  'qualified',
  'follow-up',
  'all',
  'won',
  'lost'
]

export const SECONDARY_LEAD_TABS: LeadTabKey[] = ['archived', 'high-priority', 'no-follow-up']

const VALID_TABS = new Set<string>(Object.keys(leadTabToFilter))

export function parseLeadTab(value: unknown): LeadTabKey {
  if (typeof value === 'string' && VALID_TABS.has(value)) {
    return value as LeadTabKey
  }

  return 'new'
}

export type LeadTabItem = {
  key: LeadTabKey
  label: string
  count?: number
}

const TAB_I18N_KEY: Record<LeadTabKey, string> = {
  new: 'new',
  qualified: 'qualified',
  'follow-up': 'followUp',
  won: 'won',
  lost: 'lost',
  all: 'all',
  archived: 'archived',
  'high-priority': 'highPriority',
  'no-follow-up': 'noFollowUp'
}

export function getLeadTabI18nKey(tab: LeadTabKey) {
  return TAB_I18N_KEY[tab]
}

export type LeadEmptyStateKey =
  | 'new'
  | 'qualified'
  | 'followUp'
  | 'won'
  | 'lost'
  | 'all'
  | 'archived'

export function getLeadEmptyStateKey(tab: LeadTabKey): LeadEmptyStateKey {
  if (tab === 'follow-up') return 'followUp'
  if (tab === 'high-priority' || tab === 'no-follow-up') return 'all'
  return tab
}
