import type { GraphQLContext } from '../routes/graph'
import { requirePermission } from '../utils/auth'

// D1/internal resolver output is the source for now.
// Later, external analytics rollups can be cached in KV as analytics:dashboard:v1:{range}
// with a 5–15 minute TTL. KV must not store auth state, permissions, or inbox source-of-truth.

type AnalyticsRange = 'LAST_7_DAYS' | 'LAST_30_DAYS' | 'LAST_90_DAYS'

type AnalyticsDashboardArgs = {
  range: AnalyticsRange
}

const numberFormatter = new Intl.NumberFormat('en-US')

function getRangeDays(range: AnalyticsRange) {
  if (range === 'LAST_30_DAYS') return 30
  if (range === 'LAST_90_DAYS') return 90
  return 7
}

const demoTrendSeed = [
  { visitors: 31, pageViews: 82, searchClicks: 4 },
  { visitors: 38, pageViews: 97, searchClicks: 5 },
  { visitors: 35, pageViews: 91, searchClicks: 4 },
  { visitors: 49, pageViews: 126, searchClicks: 7 },
  { visitors: 57, pageViews: 151, searchClicks: 6 },
  { visitors: 53, pageViews: 142, searchClicks: 5 },
  { visitors: 68, pageViews: 186, searchClicks: 8 },
  { visitors: 61, pageViews: 165, searchClicks: 7 },
  { visitors: 74, pageViews: 211, searchClicks: 9 },
  { visitors: 69, pageViews: 198, searchClicks: 8 },
  { visitors: 83, pageViews: 237, searchClicks: 11 },
  { visitors: 91, pageViews: 264, searchClicks: 13 },
  { visitors: 86, pageViews: 249, searchClicks: 10 },
  { visitors: 104, pageViews: 301, searchClicks: 15 }
] as const

const demoTopPages = [
  {
    title: 'Edge notes: keeping GraphQL small',
    path: '/blog/edge-notes-graphql',
    views: 428,
    visitors: 186,
    avgTime: '3m 18s',
    source: 'Search'
  },
  {
    title: 'Mohetios.dev',
    path: '/',
    views: 392,
    visitors: 214,
    avgTime: '1m 42s',
    source: 'Direct'
  },
  {
    title: 'D1 patterns for tiny products',
    path: '/blog/d1-patterns-tiny-products',
    views: 337,
    visitors: 141,
    avgTime: '4m 05s',
    source: 'Referral'
  },
  {
    title: 'Projects',
    path: '/projects',
    views: 286,
    visitors: 129,
    avgTime: '2m 11s',
    source: 'Direct'
  },
  {
    title: 'Inbox as a lightweight operating surface',
    path: '/lab/inbox-operating-surface',
    views: 244,
    visitors: 98,
    avgTime: '3m 47s',
    source: 'Newsletter'
  }
] as const

function getRangeMultiplier(days: number) {
  if (days >= 90) return 9
  if (days >= 30) return 4
  return 1
}

function formatNumber(value: number) {
  return numberFormatter.format(value)
}

function createDemoTrend(days: number) {
  return demoTrendSeed.slice(-Math.min(days, 14)).map((point, index, items) => {
    const date = new Date()
    date.setDate(date.getDate() - (items.length - 1 - index))

    return {
      date: date.toISOString().slice(5, 10),
      visitors: point.visitors,
      pageViews: point.pageViews,
      searchClicks: point.searchClicks
    }
  })
}

function createDemoMetrics(days: number, trend: ReturnType<typeof createDemoTrend>) {
  const multiplier = getRangeMultiplier(days)
  const visitors = trend.reduce((sum, point) => sum + point.visitors, 0) * multiplier
  const pageViews = trend.reduce((sum, point) => sum + point.pageViews, 0) * multiplier
  const searchClicks = trend.reduce((sum, point) => sum + point.searchClicks, 0) * multiplier

  return [
    {
      key: 'visitors',
      label: 'Visitors',
      value: formatNumber(visitors),
      helper: `${days}-day demo audience`,
      icon: 'i-lucide-users',
      trend: '+12%'
    },
    {
      key: 'pageViews',
      label: 'Page views',
      value: formatNumber(pageViews),
      helper: 'Content and project page views',
      icon: 'i-lucide-chart-line',
      trend: '+18%'
    },
    {
      key: 'searchClicks',
      label: 'Search clicks',
      value: formatNumber(searchClicks),
      helper: 'Demo organic search clicks',
      icon: 'i-lucide-mouse-pointer-click',
      trend: '+9%'
    },
    {
      key: 'avgLoad',
      label: 'Avg load',
      value: '412 ms',
      helper: 'Demo edge page response time',
      icon: 'i-lucide-gauge',
      trend: '-6%'
    }
  ]
}

function createDemoTopPages(days: number) {
  const multiplier = getRangeMultiplier(days)

  return demoTopPages.map((page) => ({
    ...page,
    views: page.views * multiplier,
    visitors: page.visitors * multiplier
  }))
}

export async function analyticsDashboard(
  _parent: unknown,
  args: AnalyticsDashboardArgs,
  context: GraphQLContext
) {
  requirePermission(context, 'dashboard:view')

  const days = getRangeDays(args.range)
  const trend = createDemoTrend(days)
  const multiplier = getRangeMultiplier(days)

  return {
    metrics: createDemoMetrics(days, trend),
    trend,
    topPages: createDemoTopPages(days),
    referrers: [
      { source: 'Search', visits: 286 * multiplier, share: 38, trend: '+9%' },
      { source: 'Direct', visits: 214 * multiplier, share: 29, trend: '+4%' },
      { source: 'Referral', visits: 143 * multiplier, share: 19, trend: '+15%' },
      { source: 'Newsletter', visits: 68 * multiplier, share: 9, trend: '+6%' },
      { source: 'Social', visits: 41 * multiplier, share: 5, trend: '-2%' }
    ],
    countries: [
      { code: 'US', country: 'United States', visits: 248 * multiplier, share: 33 },
      { code: 'IR', country: 'Iran', visits: 192 * multiplier, share: 26 },
      { code: 'DE', country: 'Germany', visits: 96 * multiplier, share: 13 },
      { code: 'GB', country: 'United Kingdom', visits: 82 * multiplier, share: 11 },
      { code: 'CA', country: 'Canada', visits: 51 * multiplier, share: 7 }
    ],
    searchQueries: [
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
      },
      {
        query: 'cloudflare pages portfolio',
        clicks: 11 * multiplier,
        impressions: 330 * multiplier,
        ctr: '3.3%',
        position: '9.1',
        page: '/projects'
      }
    ],
    webVitals: [
      {
        key: 'LCP',
        label: 'Largest Contentful Paint',
        value: '1.7s',
        status: 'Good',
        helper: 'Demo field median'
      },
      {
        key: 'INP',
        label: 'Interaction to Next Paint',
        value: '92ms',
        status: 'Good',
        helper: 'Demo interaction sample'
      },
      {
        key: 'CLS',
        label: 'Cumulative Layout Shift',
        value: '0.03',
        status: 'Good',
        helper: 'Demo visual stability sample'
      }
    ],

    edgeSummary: {
      cacheHitRatio: '91%',
      edgeRequests: formatNumber(1840 * multiplier),
      edgeErrors: String(2 * multiplier),
      avgLoadTime: '412 ms',
      loadTimeTrend: '-6%',
      progressValue: 91
    },

    dataSourceLabel: 'Demo data source',
    dataSourceDescription:
      'Demo analytics are served by the GraphQL resolver until Cloudflare Analytics, Workers metrics, and Google Search Console are connected.'
  }
}
