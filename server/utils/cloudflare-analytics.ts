import type { H3Event } from 'h3'

import { getAnalyticsConfig } from './env'

export type AnalyticsRange = 'LAST_7_DAYS' | 'LAST_30_DAYS' | 'LAST_90_DAYS'

export type AudienceTrendPoint = {
  date: string
  visitors: number
  pageViews: number
  searchClicks: number
}

export type AnalyticsTopPage = {
  title: string
  path: string
  views: number
  visitors: number
  avgTime: string
  source: string
}

export type AnalyticsReferrer = {
  source: string
  visits: number
  share: number
  trend?: string | null
}

export type AnalyticsCountry = {
  code: string
  country: string
  visits: number
  share: number
}

export type WebVitalMetric = {
  key: string
  label: string
  value: string
  status: string
  helper: string
}

export type EdgeSummary = {
  cacheHitRatio: string
  edgeRequests: string
  edgeErrors: string
  avgLoadTime: string
  loadTimeTrend?: string | null
  progressValue: number
}

export type CloudflareAnalyticsSnapshot = {
  trend: AudienceTrendPoint[]
  topPages: AnalyticsTopPage[]
  referrers: AnalyticsReferrer[]
  countries: AnalyticsCountry[]
  webVitals: WebVitalMetric[]
  edgeSummary: EdgeSummary
  dataSourceLabel: string
  dataSourceDescription: string
  isConfigured: boolean
  isPartial: boolean
}

const MAX_ADAPTIVE_DAY_BATCH = 14

const TRAFFIC_TREND_QUERY = /* GraphQL */ `
  query ZoneTrafficTrend($zoneTag: string, $since: Date, $until: Date) {
    viewer {
      zones(filter: { zoneTag: $zoneTag }) {
        httpRequests1dGroups(
          limit: 100
          filter: { date_geq: $since, date_lt: $until }
          orderBy: [date_ASC]
        ) {
          sum {
            requests
          }
          dimensions {
            date
          }
        }
      }
    }
  }
`

const DAILY_TOTAL_QUERY = /* GraphQL */ `
  query ZoneDailyTotal($zoneTag: string, $filter: filter) {
    viewer {
      zones(filter: { zoneTag: $zoneTag }) {
        httpRequestsAdaptiveGroups(limit: 1, filter: $filter) {
          count
          sum {
            visits
          }
        }
      }
    }
  }
`

const DAILY_TOP_PAGES_QUERY = /* GraphQL */ `
  query ZoneDailyTopPages($zoneTag: string, $filter: filter) {
    viewer {
      zones(filter: { zoneTag: $zoneTag }) {
        httpRequestsAdaptiveGroups(limit: 20, filter: $filter, orderBy: [count_DESC]) {
          count
          sum {
            visits
          }
          dimensions {
            clientRequestPath
          }
        }
      }
    }
  }
`

const DAILY_COUNTRIES_QUERY = /* GraphQL */ `
  query ZoneDailyCountries($zoneTag: string, $filter: filter) {
    viewer {
      zones(filter: { zoneTag: $zoneTag }) {
        httpRequestsAdaptiveGroups(limit: 10, filter: $filter, orderBy: [count_DESC]) {
          count
          sum {
            visits
          }
          dimensions {
            clientCountryName
          }
        }
      }
    }
  }
`

const DAILY_ERRORS_QUERY = /* GraphQL */ `
  query ZoneDailyErrors($zoneTag: string, $filter: filter) {
    viewer {
      zones(filter: { zoneTag: $zoneTag }) {
        httpRequestsAdaptiveGroups(limit: 1, filter: $filter) {
          count
        }
      }
    }
  }
`

function getRangeDays(range: AnalyticsRange) {
  if (range === 'LAST_90_DAYS') return 90
  if (range === 'LAST_30_DAYS') return 30
  return 7
}

function getDateBounds(range: AnalyticsRange) {
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - getRangeDays(range))

  return {
    since: start.toISOString().slice(0, 10),
    until: end.toISOString().slice(0, 10)
  }
}

function createDayFilter(hostname: string, dayStart: Date) {
  const dayEnd = new Date(dayStart)
  dayEnd.setDate(dayEnd.getDate() + 1)

  return {
    datetime_geq: dayStart.toISOString(),
    datetime_lt: dayEnd.toISOString(),
    requestSource: 'eyeball',
    clientRequestHTTPHost: hostname
  }
}

function getDailySlices(range: AnalyticsRange, hostname: string) {
  const batchDays = Math.min(getRangeDays(range), MAX_ADAPTIVE_DAY_BATCH)
  const slices: Array<{ date: string; filter: ReturnType<typeof createDayFilter> }> = []

  for (let offset = batchDays - 1; offset >= 0; offset -= 1) {
    const dayStart = new Date()
    dayStart.setHours(0, 0, 0, 0)
    dayStart.setDate(dayStart.getDate() - offset)

    slices.push({
      date: dayStart.toISOString().slice(0, 10),
      filter: createDayFilter(hostname, dayStart)
    })
  }

  return slices
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(Math.round(value || 0))
}

function countryCodeFromName(name: string) {
  if (!name || name === 'Unknown') return '—'
  return name.slice(0, 2).toUpperCase()
}

function createPendingWebVitals(): WebVitalMetric[] {
  return [
    {
      key: 'LCP',
      label: 'Largest Contentful Paint',
      value: '—',
      status: 'Pending',
      helper: 'Cloudflare Web Analytics/RUM connection pending'
    },
    {
      key: 'INP',
      label: 'Interaction to Next Paint',
      value: '—',
      status: 'Pending',
      helper: 'Cloudflare Web Analytics/RUM connection pending'
    },
    {
      key: 'CLS',
      label: 'Cumulative Layout Shift',
      value: '—',
      status: 'Pending',
      helper: 'Cloudflare Web Analytics/RUM connection pending'
    }
  ]
}

function emptyAnalyticsSnapshot(description: string): CloudflareAnalyticsSnapshot {
  return {
    trend: [],
    topPages: [],
    referrers: [],
    countries: [],
    webVitals: createPendingWebVitals(),
    edgeSummary: {
      cacheHitRatio: '—',
      edgeRequests: '0',
      edgeErrors: '0',
      avgLoadTime: '—',
      loadTimeTrend: null,
      progressValue: 0
    },
    dataSourceLabel: 'Analytics pending',
    dataSourceDescription: description,
    isConfigured: false,
    isPartial: true
  }
}

async function postCloudflareGraphql<T>(
  event: H3Event,
  query: string,
  variables: Record<string, unknown>
): Promise<T> {
  const { cloudflareAnalyticsToken: token } = getAnalyticsConfig(event)

  const response = await fetch('https://api.cloudflare.com/client/v4/graphql', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      query,
      variables
    })
  })

  if (!response.ok) {
    throw new Error(`Cloudflare Analytics request failed with status ${response.status}`)
  }

  const payload = (await response.json()) as {
    data?: T
    errors?: Array<{ message?: string }>
  }

  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message || 'GraphQL error').join('; '))
  }

  if (!payload.data) {
    throw new Error('Cloudflare Analytics returned no data')
  }

  return payload.data
}

function createMockReferrersFromTopPages(_topPages: AnalyticsTopPage[]): AnalyticsReferrer[] {
  return [
    { source: 'Direct', visits: 0, share: 0, trend: null },
    { source: 'Search', visits: 0, share: 0, trend: null },
    { source: 'Referral', visits: 0, share: 0, trend: null }
  ]
}

function mergeTopPages(
  rows: Array<{
    count: number
    sum?: { visits?: number }
    dimensions?: { clientRequestPath?: string }
  }>
) {
  const merged = new Map<string, { views: number; visitors: number }>()

  for (const row of rows) {
    const path = row.dimensions?.clientRequestPath || '/'
    const current = merged.get(path) || { views: 0, visitors: 0 }

    merged.set(path, {
      views: current.views + Number(row.count || 0),
      visitors: current.visitors + Number(row.sum?.visits || 0)
    })
  }

  return [...merged.entries()]
    .map(([path, stats]) => ({
      title: path === '/' ? 'Mohetios.dev' : path,
      path,
      views: stats.views,
      visitors: stats.visitors,
      avgTime: '—',
      source: 'Cloudflare'
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 20)
}

function mergeCountries(
  rows: Array<{
    count: number
    sum?: { visits?: number }
    dimensions?: { clientCountryName?: string }
  }>
) {
  const merged = new Map<string, number>()

  for (const row of rows) {
    const country = row.dimensions?.clientCountryName || 'Unknown'
    merged.set(country, (merged.get(country) || 0) + Number(row.sum?.visits || row.count || 0))
  }

  const totalVisits = [...merged.values()].reduce((sum, visits) => sum + visits, 0)

  return [...merged.entries()]
    .map(([country, visits]) => ({
      code: countryCodeFromName(country),
      country,
      visits,
      share: totalVisits ? Math.round((visits / totalVisits) * 100) : 0
    }))
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 10)
}

function analyticsConfigDescription(config: ReturnType<typeof getAnalyticsConfig>) {
  const missing: string[] = []

  if (String(config.enableRealAnalytics) !== 'true') {
    missing.push('NUXT_ENABLE_REAL_ANALYTICS=true')
  }

  if (!config.cloudflareAnalyticsToken) {
    missing.push('NUXT_CLOUDFLARE_ANALYTICS_TOKEN')
  }

  if (!config.cloudflareZoneId) {
    missing.push('NUXT_CLOUDFLARE_ZONE_ID')
  }

  if (!config.cloudflareHostname) {
    missing.push('NUXT_CLOUDFLARE_HOSTNAME')
  }

  if (!missing.length) {
    return 'Cloudflare Analytics is not configured. Showing pending analytics state.'
  }

  return `Cloudflare Analytics is not configured. Set ${missing.join(', ')} on Cloudflare Pages (production/preview) and redeploy if needed.`
}

async function fetchCloudflareAnalyticsFresh(
  event: H3Event,
  range: AnalyticsRange
): Promise<CloudflareAnalyticsSnapshot> {
  const config = getAnalyticsConfig(event)

  const enabled = String(config.enableRealAnalytics) === 'true'
  const token = config.cloudflareAnalyticsToken
  const zoneId = config.cloudflareZoneId
  const hostname = config.cloudflareHostname

  if (!enabled || !token || !zoneId || !hostname) {
    return emptyAnalyticsSnapshot(analyticsConfigDescription(config))
  }

  const { since, until } = getDateBounds(range)
  const dailySlices = getDailySlices(range, hostname)
  const visitorSlices = dailySlices.slice(-Math.min(getRangeDays(range), MAX_ADAPTIVE_DAY_BATCH))

  try {
    const trendData = await postCloudflareGraphql<{
      viewer: {
        zones: Array<{
          httpRequests1dGroups: Array<{
            sum?: { requests?: number }
            dimensions?: { date?: string }
          }>
        }>
      }
    }>(event, TRAFFIC_TREND_QUERY, {
      zoneTag: zoneId,
      since,
      until
    })

    const [
      visitorTotals,
      topPageBatches,
      countryBatches,
      errorTotals
    ] = await Promise.all([
      Promise.all(
        visitorSlices.map((slice) =>
          postCloudflareGraphql<{
            viewer: {
              zones: Array<{
                httpRequestsAdaptiveGroups: Array<{
                  count: number
                  sum?: { visits?: number }
                }>
              }>
            }
          }>(event, DAILY_TOTAL_QUERY, {
            zoneTag: zoneId,
            filter: slice.filter
          }).then((data) => ({
            date: slice.date,
            visits: Number(data.viewer.zones[0]?.httpRequestsAdaptiveGroups[0]?.sum?.visits || 0),
            pageViews: Number(data.viewer.zones[0]?.httpRequestsAdaptiveGroups[0]?.count || 0)
          }))
        )
      ),
      Promise.all(
        dailySlices.map((slice) =>
          postCloudflareGraphql<{
            viewer: {
              zones: Array<{
                httpRequestsAdaptiveGroups: Array<{
                  count: number
                  sum?: { visits?: number }
                  dimensions?: { clientRequestPath?: string }
                }>
              }>
            }
          }>(event, DAILY_TOP_PAGES_QUERY, {
            zoneTag: zoneId,
            filter: slice.filter
          }).then((data) => data.viewer.zones[0]?.httpRequestsAdaptiveGroups || [])
        )
      ),
      Promise.all(
        dailySlices.map((slice) =>
          postCloudflareGraphql<{
            viewer: {
              zones: Array<{
                httpRequestsAdaptiveGroups: Array<{
                  count: number
                  sum?: { visits?: number }
                  dimensions?: { clientCountryName?: string }
                }>
              }>
            }
          }>(event, DAILY_COUNTRIES_QUERY, {
            zoneTag: zoneId,
            filter: slice.filter
          }).then((data) => data.viewer.zones[0]?.httpRequestsAdaptiveGroups || [])
        )
      ),
      Promise.all(
        dailySlices.map((slice) =>
          postCloudflareGraphql<{
            viewer: {
              zones: Array<{
                httpRequestsAdaptiveGroups: Array<{ count: number }>
              }>
            }
          }>(event, DAILY_ERRORS_QUERY, {
            zoneTag: zoneId,
            filter: {
              ...slice.filter,
              edgeResponseStatus_geq: 500
            }
          }).then((data) => Number(data.viewer.zones[0]?.httpRequestsAdaptiveGroups[0]?.count || 0))
        )
      )
    ])

    const trendRows = trendData.viewer.zones[0]?.httpRequests1dGroups || []
    const visitsByDate = new Map(visitorTotals.map((row) => [row.date, row.visits]))

    const trend = trendRows
      .map((row) => {
        const date = String(row.dimensions?.date || '')
        return {
          date,
          visitors: visitsByDate.get(date) || 0,
          pageViews: Number(row.sum?.requests || 0),
          searchClicks: 0
        }
      })
      .filter((point) => point.date)
      .sort((a, b) => a.date.localeCompare(b.date))

    const topPages = mergeTopPages(topPageBatches.flat())
    const countries = mergeCountries(countryBatches.flat())

    const edgeRequests = trend.reduce((sum, point) => sum + point.pageViews, 0)
    const edgeErrors = errorTotals.reduce((sum, count) => sum + count, 0)

    const partialRange = getRangeDays(range) > MAX_ADAPTIVE_DAY_BATCH

    return {
      trend,
      topPages,
      referrers: createMockReferrersFromTopPages(topPages),
      countries,
      webVitals: createPendingWebVitals(),
      edgeSummary: {
        cacheHitRatio: '—',
        edgeRequests: formatNumber(edgeRequests),
        edgeErrors: formatNumber(edgeErrors),
        avgLoadTime: '—',
        loadTimeTrend: null,
        progressValue: 0
      },
      dataSourceLabel: 'Cloudflare Analytics',
      dataSourceDescription: partialRange
        ? `Traffic trend covers ${getRangeDays(range)} days. Top pages, countries, and edge details use the most recent ${MAX_ADAPTIVE_DAY_BATCH} days due to Cloudflare query limits.`
        : 'Traffic and edge metrics are loaded from Cloudflare Analytics and cached with Nitro/KV.',
      isConfigured: true,
      isPartial: partialRange
    }
  } catch (error) {
    return {
      ...emptyAnalyticsSnapshot(
        error instanceof Error
          ? `Cloudflare Analytics failed: ${error.message}`
          : 'Cloudflare Analytics failed.'
      ),
      isConfigured: true,
      dataSourceLabel: 'Cloudflare Analytics unavailable'
    }
  }
}

const cachedCloudflareAnalytics = cachedFunction(
  async (event: H3Event, range: AnalyticsRange) => {
    return await fetchCloudflareAnalyticsFresh(event, range)
  },
  {
    name: 'cloudflare-analytics',
    group: 'analytics',
    getKey: (_event: H3Event, range: AnalyticsRange) => `dashboard:${range}`,
    maxAge: 60,
    swr: true
  }
)

export async function getCachedCloudflareAnalytics(
  event: H3Event,
  range: AnalyticsRange
): Promise<CloudflareAnalyticsSnapshot> {
  if (import.meta.dev) {
    return await fetchCloudflareAnalyticsFresh(event, range)
  }

  const snapshot = await cachedCloudflareAnalytics(event, range)
  return snapshot ?? (await fetchCloudflareAnalyticsFresh(event, range))
}
