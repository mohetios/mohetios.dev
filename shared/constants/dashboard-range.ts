export const DASHBOARD_ANALYTICS_RANGES = [
  'LAST_7_DAYS',
  'LAST_30_DAYS',
  'LAST_90_DAYS'
] as const

export type DashboardAnalyticsRange = (typeof DASHBOARD_ANALYTICS_RANGES)[number]

export const DEFAULT_DASHBOARD_RANGE: DashboardAnalyticsRange = 'LAST_7_DAYS'

export function parseDashboardRange(value: unknown): DashboardAnalyticsRange {
  if (
    typeof value === 'string' &&
    DASHBOARD_ANALYTICS_RANGES.includes(value as DashboardAnalyticsRange)
  ) {
    return value as DashboardAnalyticsRange
  }

  return DEFAULT_DASHBOARD_RANGE
}

export const DASHBOARD_RANGE_LABEL_KEYS: Record<DashboardAnalyticsRange, string> = {
  LAST_7_DAYS: 'dashboard.analytics.ranges.last7Days',
  LAST_30_DAYS: 'dashboard.analytics.ranges.last30Days',
  LAST_90_DAYS: 'dashboard.analytics.ranges.last90Days'
}
