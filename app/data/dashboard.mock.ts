export type DashboardMetric = {
  key: string
  label: string
  value: string
  icon: string
  trend?: string
  trendDirection?: 'up' | 'down' | 'neutral'
  helper: string
}

export type AudiencePoint = {
  label: string
  value: number
}

export type InboxPreviewItem = {
  id: string
  title: string
  source: 'Email' | 'Contact Form' | 'System' | 'Newsletter'
  preview: string
  time: string
  icon: string
  badge?: {
    label: string
    color: 'primary' | 'success' | 'warning' | 'error' | 'neutral'
  }
}

export type ContentPulseItem = {
  id: string
  title: string
  status: 'Published' | 'Draft' | 'Scheduled'
  views?: string
}

export type ReaderSignal = {
  label: string
  value: string
}

export type SystemStatusItem = {
  label: string
  status: 'Active' | 'Warning' | 'Offline'
}

export type RecentActivityItem = {
  id: string
  title: string
  time: string
  icon: string
  color: 'primary' | 'success' | 'warning' | 'error' | 'neutral'
}

export type SystemHealthData = {
  status: string
  metrics: Array<{
    label: string
    value: string
    trend: string
    icon: string
  }>
  webVitals: Array<{
    label: string
    value: string
    status: string
  }>
  services: SystemStatusItem[]
}

export const dashboardMetrics: DashboardMetric[] = [
  {
    key: 'visitors',
    label: 'Visitors',
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
    key: 'inbox',
    label: 'Inbox',
    value: '34',
    icon: 'i-lucide-inbox',
    trend: '21.2%',
    trendDirection: 'up',
    helper: 'vs prior 7 days'
  },
  {
    key: 'published',
    label: 'Published',
    value: '6',
    icon: 'i-lucide-file-text',
    trendDirection: 'neutral',
    helper: 'vs prior 7 days'
  }
]

export const audienceData: AudiencePoint[] = [
  { label: 'May 12', value: 1500 },
  { label: 'May 13', value: 2250 },
  { label: 'May 14', value: 3050 },
  { label: 'May 15', value: 2450 },
  { label: 'May 16', value: 2850 },
  { label: 'May 17', value: 3600 },
  { label: 'May 18', value: 2900 }
]

export const audienceSummary = {
  value: '12,842',
  trend: '14.6%',
  trendDirection: 'up' as const,
  helperKey: 'dashboard.overview.audienceHelper'
}

export const inboxPreviewItems: InboxPreviewItem[] = [
  {
    id: 'thread_001',
    title: 'Collaboration inquiry',
    source: 'Email',
    preview: 'Hi there, I’d love to explore a possible collaboration...',
    time: '2h',
    icon: 'i-lucide-mail',
    badge: { label: 'Needs Reply', color: 'primary' }
  },
  {
    id: 'thread_002',
    title: 'Contact form submission',
    source: 'Contact Form',
    preview: 'I’d like to learn more about your partnerships...',
    time: '4h',
    icon: 'i-lucide-user-round',
    badge: { label: 'Lead', color: 'success' }
  },
  {
    id: 'thread_003',
    title: 'System Alert: High Error Rate',
    source: 'System',
    preview: 'Error rate exceeded 1% on /api/content endpoints.',
    time: '5h',
    icon: 'i-lucide-triangle-alert',
    badge: { label: 'High', color: 'error' }
  },
  {
    id: 'thread_004',
    title: 'Newsletter reply',
    source: 'Newsletter',
    preview: 'Thanks for the great insights—especially the part...',
    time: '1d',
    icon: 'i-lucide-newspaper',
    badge: { label: 'Needs Reply', color: 'primary' }
  }
]

export const contentPulseItems: ContentPulseItem[] = [
  {
    id: 'content_001',
    title: 'The Quiet Web: Building for Depth',
    status: 'Published',
    views: '3,842'
  },
  {
    id: 'content_002',
    title: 'Notes on Focus in a Distracted World',
    status: 'Published',
    views: '2,901'
  },
  {
    id: 'content_003',
    title: 'Why I Write in Public',
    status: 'Published',
    views: '2,104'
  },
  {
    id: 'content_004',
    title: 'Weekly Note #23',
    status: 'Draft'
  },
  {
    id: 'content_005',
    title: 'Building Systems, Not Goals',
    status: 'Scheduled'
  }
]

export const readerSignals = {
  referrers: [
    { label: 'Google', value: '42.1%' },
    { label: 'Direct', value: '28.3%' },
    { label: 'Twitter / X', value: '9.7%' },
    { label: 'Reddit', value: '6.1%' },
    { label: 'Newsletter', value: '4.3%' }
  ] satisfies ReaderSignal[],
  countries: [
    { label: 'United States', value: '38.6%' },
    { label: 'United Kingdom', value: '11.8%' },
    { label: 'Canada', value: '7.6%' },
    { label: 'Australia', value: '5.4%' },
    { label: 'Germany', value: '4.3%' }
  ] satisfies ReaderSignal[],
  tags: [
    { label: '# writing', value: '1,284' },
    { label: '# productivity', value: '1,022' },
    { label: '# indie', value: '845' },
    { label: '# notes', value: '712' },
    { label: '# systems', value: '603' }
  ] satisfies ReaderSignal[]
}

export const systemHealth: SystemHealthData = {
  status: 'All Systems Operational',
  metrics: [
    { label: 'Requests', value: '214K', trend: '12.4%', icon: 'i-lucide-activity' },
    { label: 'Error Rate', value: '0.36%', trend: '28.7%', icon: 'i-lucide-bug' },
    { label: 'Cache Hit', value: '87.1%', trend: '6.3%', icon: 'i-lucide-database-zap' }
  ],
  webVitals: [
    { label: 'LCP', value: '1.4s', status: 'Good' },
    { label: 'INP', value: '96ms', status: 'Good' },
    { label: 'CLS', value: '0.04', status: 'Good' }
  ],
  services: [
    { label: 'Email Routing', status: 'Active' },
    { label: 'Email Worker', status: 'Active' },
    { label: 'D1', status: 'Active' },
    { label: 'Turnstile', status: 'Active' }
  ] satisfies SystemStatusItem[]
}

export const recentActivityItems: RecentActivityItem[] = [
  {
    id: 'activity_001',
    title: 'Published “The Quiet Web: Building for Depth”',
    time: 'May 18, 2025 at 9:14 AM',
    icon: 'i-lucide-check-circle',
    color: 'success'
  },
  {
    id: 'activity_002',
    title: 'New inbox message from Jane Smith',
    time: 'May 18, 2025 at 9:22 AM',
    icon: 'i-lucide-mail',
    color: 'primary'
  },
  {
    id: 'activity_003',
    title: 'Cache purge completed',
    time: 'May 17, 2025 at 11:07 PM',
    icon: 'i-lucide-info',
    color: 'primary'
  },
  {
    id: 'activity_004',
    title: 'Deployment completed',
    time: 'May 17, 2025 at 9:31 PM',
    icon: 'i-lucide-rocket',
    color: 'success'
  }
]
