import type { GraphQLContext } from '../routes/graph'
import { requirePermission } from '../utils/auth'
import {
  getCachedCloudflareAnalytics,
  type AnalyticsRange,
  type AudienceTrendPoint,
  type CloudflareAnalyticsSnapshot
} from '../utils/cloudflare-analytics'

type AnalyticsDashboardArgs = {
  range: AnalyticsRange
}

const numberFormatter = new Intl.NumberFormat('en-US')

function formatNumber(value: number) {
  return numberFormatter.format(Math.round(value || 0))
}

function createMetrics(snapshot: CloudflareAnalyticsSnapshot, range: AnalyticsRange) {
  const visitors = snapshot.trend.reduce(
    (sum: number, point: AudienceTrendPoint) => sum + point.visitors,
    0
  )
  const pageViews = snapshot.trend.reduce(
    (sum: number, point: AudienceTrendPoint) => sum + point.pageViews,
    0
  )
  const searchClicks = snapshot.trend.reduce(
    (sum: number, point: AudienceTrendPoint) => sum + point.searchClicks,
    0
  )

  const helper =
    range === 'LAST_90_DAYS'
      ? 'Last 90 days'
      : range === 'LAST_30_DAYS'
        ? 'Last 30 days'
        : 'Last 7 days'

  return [
    {
      key: 'visitors',
      label: 'Visitors',
      value: formatNumber(visitors),
      helper,
      icon: 'i-lucide-users',
      trend: null
    },
    {
      key: 'pageViews',
      label: 'Page views',
      value: formatNumber(pageViews),
      helper: 'Cloudflare request/page activity',
      icon: 'i-lucide-chart-line',
      trend: null
    },
    {
      key: 'searchClicks',
      label: 'Search clicks',
      value: formatNumber(searchClicks),
      helper: 'Mocked until Google Search Console is connected',
      icon: 'i-lucide-mouse-pointer-click',
      trend: null
    },
    {
      key: 'edgeRequests',
      label: 'Edge requests',
      value: snapshot.edgeSummary.edgeRequests,
      helper: 'Cloudflare edge traffic',
      icon: 'i-lucide-globe',
      trend: null
    }
  ]
}

function createMockSearchQueries(range: AnalyticsRange) {
  const multiplier = range === 'LAST_90_DAYS' ? 9 : range === 'LAST_30_DAYS' ? 4 : 1

  return [
    {
      query: 'cloudflare d1 nuxt graphql',
      clicks: 24 * multiplier,
      impressions: 620 * multiplier,
      ctr: '3.9%',
      position: '7.4',
      page: '/blog/d1-patterns-tiny-products'
    },
    {
      query: 'nuxt graphql yoga cloudflare',
      clicks: 19 * multiplier,
      impressions: 470 * multiplier,
      ctr: '4.0%',
      position: '6.8',
      page: '/blog/edge-notes-graphql'
    },
    {
      query: 'personal engineering notebook',
      clicks: 14 * multiplier,
      impressions: 290 * multiplier,
      ctr: '4.8%',
      position: '5.9',
      page: '/'
    }
  ]
}

export async function analyticsDashboard(
  _parent: unknown,
  args: AnalyticsDashboardArgs,
  context: GraphQLContext
) {
  requirePermission(context, 'dashboard:view')

  const snapshot = await getCachedCloudflareAnalytics(context.event, args.range)

  return {
    metrics: createMetrics(snapshot, args.range),
    trend: snapshot.trend,
    topPages: snapshot.topPages,
    referrers: snapshot.referrers,
    countries: snapshot.countries,
    searchQueries: createMockSearchQueries(args.range),
    webVitals: snapshot.webVitals,
    edgeSummary: snapshot.edgeSummary,
    dataSourceLabel: snapshot.dataSourceLabel,
    dataSourceDescription: snapshot.dataSourceDescription
  }
}
