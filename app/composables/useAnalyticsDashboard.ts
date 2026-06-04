import type { AnalyticsDashboardQuery, AnalyticsRange } from '#gql'

export type { AnalyticsRange }

export type AnalyticsDashboard = AnalyticsDashboardQuery['analyticsDashboard']

function createDefaultAnalyticsDashboard(): AnalyticsDashboard {
  return {
    metrics: [],
    trend: [],
    topPages: [],
    referrers: [],
    countries: [],
    searchQueries: [],
    webVitals: [],
    edgeSummary: {
      cacheHitRatio: '—',
      edgeRequests: '—',
      edgeErrors: '—',
      avgLoadTime: '—',
      loadTimeTrend: '',
      progressValue: 0
    },
    dataSourceLabel: 'Data source',
    dataSourceDescription: ''
  }
}

export function useAnalyticsDashboard(range: Ref<AnalyticsRange>) {
  const auth = useAuth()
  auth.restoreToken()

  return useAsyncData<AnalyticsDashboard>(
    () => `dashboard:analytics:${range.value}`,
    async () => {
      const result = await GqlAnalyticsDashboard({ range: range.value })
      return result.analyticsDashboard
    },
    {
      default: createDefaultAnalyticsDashboard,
      watch: [range]
    }
  )
}
