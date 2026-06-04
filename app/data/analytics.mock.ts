export type AnalyticsMetric = {
  key: string
  label: string
  value: string
  icon: string
  trend?: string
  trendDirection?: 'up' | 'down' | 'neutral'
  helper: string
}

export type AnalyticsTrendPoint = {
  date: string
  visitors: number
  pageViews: number
  searchClicks: number
}

export type TopPage = {
  path: string
  title: string
  views: number
  visitors: number
  avgTime: string
  source: 'Direct' | 'Search' | 'Social' | 'Referral' | 'Newsletter'
}

export type ReferrerItem = {
  source: string
  visits: number
  share: number
  trend: string
}

export type CountryItem = {
  country: string
  code: string
  visits: number
  share: number
}

export type SearchQueryItem = {
  query: string
  clicks: number
  impressions: number
  ctr: string
  position: string
  page: string
}

export type WebVitalItem = {
  key: 'LCP' | 'INP' | 'CLS'
  label: string
  value: string
  status: 'Good' | 'Needs improvement' | 'Poor'
  helper: string
}

export const analyticsMetrics: AnalyticsMetric[] = [
  {
    key: 'visits',
    label: 'Visits',
    value: '12,842',
    icon: 'i-lucide-users',
    trend: '14.6%',
    trendDirection: 'up',
    helper: 'vs prior 7 days'
  },
  {
    key: 'pageViews',
    label: 'Page Views',
    value: '28,731',
    icon: 'i-lucide-eye',
    trend: '18.3%',
    trendDirection: 'up',
    helper: 'vs prior 7 days'
  },
  {
    key: 'searchClicks',
    label: 'Search Clicks',
    value: '1,284',
    icon: 'i-lucide-mouse-pointer-click',
    trend: '9.8%',
    trendDirection: 'up',
    helper: 'from Google Search'
  },
  {
    key: 'avgLoad',
    label: 'Avg Load',
    value: '1.4s',
    icon: 'i-lucide-gauge',
    trend: '8.2%',
    trendDirection: 'down',
    helper: 'faster than prior period'
  }
]

export const analyticsTrend: AnalyticsTrendPoint[] = [
  { date: 'May 12', visitors: 1500, pageViews: 3300, searchClicks: 120 },
  { date: 'May 13', visitors: 2250, pageViews: 4800, searchClicks: 160 },
  { date: 'May 14', visitors: 3050, pageViews: 6200, searchClicks: 210 },
  { date: 'May 15', visitors: 2450, pageViews: 5200, searchClicks: 180 },
  { date: 'May 16', visitors: 2850, pageViews: 5900, searchClicks: 220 },
  { date: 'May 17', visitors: 3600, pageViews: 7100, searchClicks: 260 },
  { date: 'May 18', visitors: 2900, pageViews: 6100, searchClicks: 134 }
]

export const topPages: TopPage[] = [
  {
    path: '/writing/the-quiet-web',
    title: 'The Quiet Web: Building for Depth',
    views: 3842,
    visitors: 2410,
    avgTime: '4m 12s',
    source: 'Search'
  },
  {
    path: '/writing/focus-distracted-world',
    title: 'Notes on Focus in a Distracted World',
    views: 2901,
    visitors: 1872,
    avgTime: '3m 41s',
    source: 'Direct'
  },
  {
    path: '/projects/mohetios-dashboard',
    title: 'Mohetios Dashboard System',
    views: 2104,
    visitors: 1440,
    avgTime: '5m 08s',
    source: 'Referral'
  },
  {
    path: '/lab/cloudflare-native-inbox',
    title: 'Cloudflare-native Inbox Notes',
    views: 1688,
    visitors: 980,
    avgTime: '4m 52s',
    source: 'Social'
  },
  {
    path: '/about',
    title: 'About Ali Zemani',
    views: 1230,
    visitors: 1104,
    avgTime: '2m 19s',
    source: 'Direct'
  }
]

export const referrers: ReferrerItem[] = [
  { source: 'Google', visits: 5405, share: 42.1, trend: '+12.4%' },
  { source: 'Direct', visits: 3634, share: 28.3, trend: '+8.1%' },
  { source: 'Twitter / X', visits: 1246, share: 9.7, trend: '+22.6%' },
  { source: 'Reddit', visits: 783, share: 6.1, trend: '+4.2%' },
  { source: 'Newsletter', visits: 552, share: 4.3, trend: '+18.9%' }
]

export const countries: CountryItem[] = [
  { country: 'United States', code: 'US', visits: 4957, share: 38.6 },
  { country: 'United Kingdom', code: 'GB', visits: 1515, share: 11.8 },
  { country: 'Canada', code: 'CA', visits: 976, share: 7.6 },
  { country: 'Australia', code: 'AU', visits: 693, share: 5.4 },
  { country: 'Germany', code: 'DE', visits: 552, share: 4.3 },
  { country: 'Netherlands', code: 'NL', visits: 398, share: 3.1 }
]

export const searchQueries: SearchQueryItem[] = [
  {
    query: 'personal engineering notebook',
    clicks: 248,
    impressions: 4200,
    ctr: '5.9%',
    position: '7.2',
    page: '/writing/the-quiet-web'
  },
  {
    query: 'cloudflare email worker inbox',
    clicks: 196,
    impressions: 3100,
    ctr: '6.3%',
    position: '5.8',
    page: '/lab/cloudflare-native-inbox'
  },
  {
    query: 'nuxt dashboard design',
    clicks: 164,
    impressions: 2800,
    ctr: '5.8%',
    position: '8.4',
    page: '/projects/mohetios-dashboard'
  },
  {
    query: 'building in public notes',
    clicks: 141,
    impressions: 2500,
    ctr: '5.6%',
    position: '9.1',
    page: '/writing/focus-distracted-world'
  },
  {
    query: 'ali zemani mohetios',
    clicks: 109,
    impressions: 760,
    ctr: '14.3%',
    position: '2.1',
    page: '/about'
  }
]

export const webVitals: WebVitalItem[] = [
  {
    key: 'LCP',
    label: 'Largest Contentful Paint',
    value: '1.4s',
    status: 'Good',
    helper: 'Main content loads quickly.'
  },
  {
    key: 'INP',
    label: 'Interaction to Next Paint',
    value: '96ms',
    status: 'Good',
    helper: 'Interactions feel responsive.'
  },
  {
    key: 'CLS',
    label: 'Cumulative Layout Shift',
    value: '0.04',
    status: 'Good',
    helper: 'Layout is visually stable.'
  }
]
