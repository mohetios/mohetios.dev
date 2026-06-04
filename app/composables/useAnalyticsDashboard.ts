type GraphqlResponse<T> = {
  data?: T
  errors?: Array<{ message?: string }>
}

export type AnalyticsRange = 'LAST_7_DAYS' | 'LAST_30_DAYS' | 'LAST_90_DAYS'

export type AnalyticsDashboard = {
  metrics: Array<{
    key: string
    label: string
    value: string
    helper: string
    icon: string
    trend?: string | null
  }>

  trend: Array<{
    date: string
    visitors: number
    pageViews: number
    searchClicks: number
  }>

  topPages: Array<{
    title: string
    path: string
    views: number
    visitors: number
    avgTime: string
    source: string
  }>

  referrers: Array<{
    source: string
    visits: number
    share: number
    trend: string
  }>

  countries: Array<{
    code: string
    country: string
    visits: number
    share: number
  }>

  searchQueries: Array<{
    query: string
    clicks: number
    impressions: number
    ctr: string
    position: string
    page: string
  }>

  webVitals: Array<{
    key: string
    label: string
    value: string
    status: string
    helper: string
  }>

  edgeSummary: {
    cacheHitRatio: string
    edgeRequests: string
    edgeErrors: string
    avgLoadTime: string
    loadTimeTrend: string
    progressValue: number
  }

  dataSourceLabel: string
  dataSourceDescription: string
  isExternalProviderConnected: boolean
}

type AnalyticsDashboardQuery = {
  analyticsDashboard: AnalyticsDashboard
}

async function requestAnalyticsGraphql<T>(
  query: string,
  variables: Record<string, unknown> = {}
) {
  const auth = useAuth()
  const token = auth.restoreToken()

  const response = await $fetch<GraphqlResponse<T>>('/graph', {
    method: 'POST',
    headers: token
      ? {
          Authorization: `Bearer ${token}`
        }
      : undefined,
    body: {
      query,
      variables
    }
  })

  if (response.errors?.length) {
    throw new Error(response.errors[0]?.message || 'GraphQL request failed')
  }

  if (!response.data) {
    throw new Error('GraphQL request failed')
  }

  return response.data
}

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
    dataSourceDescription: '',
    isExternalProviderConnected: false
  }
}

export function useAnalyticsDashboard(range: Ref<AnalyticsRange>) {
  return useAsyncData<AnalyticsDashboard>(
    () => `dashboard:analytics:${range.value}`,
    async () => {
      const result = await requestAnalyticsGraphql<AnalyticsDashboardQuery>(
        `
          query AnalyticsDashboard($range: AnalyticsRange!) {
            analyticsDashboard(range: $range) {
              metrics {
                key
                label
                value
                helper
                icon
                trend
              }

              trend {
                date
                visitors
                pageViews
                searchClicks
              }

              topPages {
                title
                path
                views
                visitors
                avgTime
                source
              }

              referrers {
                source
                visits
                share
                trend
              }

              countries {
                code
                country
                visits
                share
              }

              searchQueries {
                query
                clicks
                impressions
                ctr
                position
                page
              }

              webVitals {
                key
                label
                value
                status
                helper
              }

              edgeSummary {
                cacheHitRatio
                edgeRequests
                edgeErrors
                avgLoadTime
                loadTimeTrend
                progressValue
              }

              dataSourceLabel
              dataSourceDescription
              isExternalProviderConnected
            }
          }
        `,
        {
          range: range.value
        }
      )

      return result.analyticsDashboard
    },
    {
      default: createDefaultAnalyticsDashboard,
      watch: [range]
    }
  )
}
