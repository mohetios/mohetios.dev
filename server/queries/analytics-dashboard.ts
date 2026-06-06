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
      helper: 'Google Search Console not connected yet',
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
    searchQueries: [],
    webVitals: snapshot.webVitals,
    edgeSummary: snapshot.edgeSummary,
    dataSourceLabel: snapshot.dataSourceLabel,
    dataSourceDescription: snapshot.dataSourceDescription
  }
}
