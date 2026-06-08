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
