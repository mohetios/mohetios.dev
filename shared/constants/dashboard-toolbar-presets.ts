import { supportedLocales } from './locales'

export type DashboardToolbarPresetAction = {
  id: string
  labelKey: string
  icon?: string
  to?: string
  disabled?: boolean
}

export type DashboardToolbarPreset = {
  showRange: boolean
  refreshLabelKey: string
  actions: DashboardToolbarPresetAction[]
}

const escapedLocales = supportedLocales.map((locale) =>
  locale.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
)
const localePrefixRegex = new RegExp(`^\\/(${escapedLocales.join('|')})(?=\\/|$)`)

function normalizeDashboardPath(path: string) {
  return path.replace(localePrefixRegex, '') || '/'
}

const PRESETS: Record<string, DashboardToolbarPreset> = {
  '/dashboard': {
    showRange: true,
    refreshLabelKey: 'dashboard.home.refresh',
    actions: [
      {
        id: 'open-inbox',
        labelKey: 'dashboard.overview.openInbox',
        icon: 'i-lucide-inbox',
        to: '/dashboard/inbox'
      }
    ]
  },
  '/dashboard/analytics': {
    showRange: true,
    refreshLabelKey: 'dashboard.analytics.refresh',
    actions: []
  },
  '/dashboard/inbox': {
    showRange: false,
    refreshLabelKey: 'dashboard.inbox.refresh',
    actions: []
  },
  '/dashboard/leads': {
    showRange: false,
    refreshLabelKey: 'dashboard.leads.refresh',
    actions: [
      {
        id: 'add-manual-lead',
        labelKey: 'dashboard.leads.addManualLead',
        icon: 'i-lucide-plus',
        disabled: true
      }
    ]
  },
  '/dashboard/newsletter': {
    showRange: false,
    refreshLabelKey: 'dashboard.newsletter.refresh',
    actions: []
  },
  '/dashboard/comments': {
    showRange: false,
    refreshLabelKey: 'dashboard.comments.refresh',
    actions: []
  }
}

export function getDashboardToolbarPreset(path: string): DashboardToolbarPreset | null {
  return PRESETS[normalizeDashboardPath(path)] ?? null
}
