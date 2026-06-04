import type { GraphQLContext } from '../routes/graph'
import { requirePermission } from '../utils/auth'

// D1/internal resolver output is the source for now.
// Later, external analytics rollups can be cached in KV as analytics:dashboard:v1:{range}
// with a 5–15 minute TTL. KV must not store auth state, permissions, or inbox source-of-truth.

type AnalyticsRange = 'LAST_7_DAYS' | 'LAST_30_DAYS' | 'LAST_90_DAYS'

type AnalyticsDashboardArgs = {
  range: AnalyticsRange
}

function getRangeDays(range: AnalyticsRange) {
  if (range === 'LAST_30_DAYS') return 30
  if (range === 'LAST_90_DAYS') return 90
  return 7
}

function createEmptyTrend(days: number) {
  return Array.from({ length: Math.min(days, 14) }).map((_, index, items) => {
    const date = new Date()
    date.setDate(date.getDate() - (items.length - 1 - index))

    return {
      date: date.toISOString().slice(5, 10),
      visitors: 0,
      pageViews: 0,
      searchClicks: 0
    }
  })
}

function createEmptyMetrics() {
  return [
    {
      key: 'visitors',
      label: 'Visitors',
      value: '0',
      helper: 'External analytics provider is not connected yet',
      icon: 'i-lucide-users',
      trend: null
    },
    {
      key: 'pageViews',
      label: 'Page views',
      value: '0',
      helper: 'External analytics provider is not connected yet',
      icon: 'i-lucide-chart-line',
      trend: null
    },
    {
      key: 'searchClicks',
      label: 'Search clicks',
      value: '0',
      helper: 'Search Console is not connected yet',
      icon: 'i-lucide-mouse-pointer-click',
      trend: null
    },
    {
      key: 'avgLoad',
      label: 'Avg load',
      value: '—',
      helper: 'Performance provider is not connected yet',
      icon: 'i-lucide-gauge',
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

  const days = getRangeDays(args.range)

  return {
    metrics: createEmptyMetrics(),

    trend: createEmptyTrend(days),

    topPages: [],

    referrers: [],

    countries: [],

    searchQueries: [],

    webVitals: [
      {
        key: 'LCP',
        label: 'Largest Contentful Paint',
        value: '—',
        status: 'Pending',
        helper: 'Connect performance analytics later'
      },
      {
        key: 'INP',
        label: 'Interaction to Next Paint',
        value: '—',
        status: 'Pending',
        helper: 'Connect performance analytics later'
      },
      {
        key: 'CLS',
        label: 'Cumulative Layout Shift',
        value: '—',
        status: 'Pending',
        helper: 'Connect performance analytics later'
      }
    ],

    edgeSummary: {
      cacheHitRatio: '—',
      edgeRequests: '—',
      edgeErrors: '—',
      avgLoadTime: '—',
      loadTimeTrend: '',
      progressValue: 0
    },

    dataSourceLabel: 'Data source',
    dataSourceDescription:
      'External analytics providers are not connected yet. This page is now backend-driven and ready for Cloudflare Analytics, Workers metrics, and Google Search Console integration.',
    isExternalProviderConnected: false
  }
}
