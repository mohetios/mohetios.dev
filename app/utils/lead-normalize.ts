import type { LeadItemDto } from '~/composables/useLeadsWorkspace'

export type Lead = LeadItemDto & {
  relativeLastActivityAt: string
  isFollowUpOverdue: boolean
}

function createRelativeTimeFormatter(locale: string) {
  return new Intl.RelativeTimeFormat(locale === 'fa' ? 'fa' : 'en', {
    numeric: 'auto'
  })
}

function formatRelativeTime(timestamp: number, formatter: Intl.RelativeTimeFormat) {
  const diffMs = timestamp - Date.now()
  const diffMinutes = Math.round(diffMs / (1000 * 60))

  if (Math.abs(diffMinutes) < 60) {
    return formatter.format(diffMinutes, 'minute')
  }

  const diffHours = Math.round(diffMinutes / 60)

  if (Math.abs(diffHours) < 24) {
    return formatter.format(diffHours, 'hour')
  }

  const diffDays = Math.round(diffHours / 24)
  return formatter.format(diffDays, 'day')
}

export function normalizeLeadDto(lead: LeadItemDto, locale: string): Lead {
  const formatter = createRelativeTimeFormatter(locale)

  return {
    ...lead,
    relativeLastActivityAt: formatRelativeTime(lead.lastActivityAt, formatter),
    isFollowUpOverdue: Boolean(lead.nextFollowUpAt && lead.nextFollowUpAt < Date.now())
  }
}

export function getLeadSourceLabel(source: LeadItemDto['source'], t: (key: string) => string) {
  if (source === 'CONTACT_FORM') {
    return t('dashboard.home.inboxPreview.sourceContactForm')
  }

  return t('dashboard.home.inboxPreview.sourceEmail')
}

export function getLeadStatusLabel(status: LeadItemDto['status'], t: (key: string) => string) {
  const keyMap: Record<LeadItemDto['status'], string> = {
    NEW: 'new',
    QUALIFIED: 'qualified',
    FOLLOW_UP: 'followUp',
    WON: 'won',
    LOST: 'lost',
    ARCHIVED: 'archived'
  }

  return t(`dashboard.leads.status.${keyMap[status]}`)
}

export function getLeadStatusColor(status: LeadItemDto['status']) {
  const colorMap: Record<LeadItemDto['status'], 'primary' | 'success' | 'warning' | 'neutral' | 'error'> =
    {
      NEW: 'primary',
      QUALIFIED: 'success',
      FOLLOW_UP: 'warning',
      WON: 'success',
      LOST: 'neutral',
      ARCHIVED: 'neutral'
    }

  return colorMap[status]
}

export function getLeadPriorityLabel(priority: LeadItemDto['priority'], t: (key: string) => string) {
  const keyMap: Record<LeadItemDto['priority'], string> = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high'
  }

  return t(`dashboard.leads.priority.${keyMap[priority]}`)
}

export function formatLeadDate(timestamp?: number | null, locale = 'en') {
  if (!timestamp) {
    return '—'
  }

  return new Intl.DateTimeFormat(locale === 'fa' ? 'fa-IR' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(timestamp))
}
