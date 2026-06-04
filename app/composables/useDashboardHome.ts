export type DashboardHome = {
  summary: {
    inboxUnread: number
    needsReply: number
    leads: number
    visits: number
    pageViews: number
    searchClicks: number
    avgLoadMs: number
  }

  audienceTrend: Array<{
    date: string
    visitors: number
    pageViews: number
  }>

  inboxPreview: Array<{
    id: string
    source: string
    status: string
    kind: string
    senderName: string
    senderEmail: string
    subject: string
    preview: string
    createdAt: number
  }>

  contentPulse: {
    publishedCount: number
    draftCount: number
    latestItems: Array<{
      id: string
      title: string
      slug: string
      section: string
      status: string
      updatedAt: number
    }>
  }

  readerSignals: Array<{
    label: string
    value: string
    helper: string
    icon: string
  }>

  systemHealth: Array<{
    key: string
    label: string
    status: string
    helper: string
  }>

  recentActivity: Array<{
    id: string
    type: string
    title: string
    description: string
    createdAt: number
    href?: string | null
  }>

  quickLinks: Array<{
    key: string
    label: string
    description: string
    icon: string
    to: string
  }>
}

type DashboardHomeQuery = {
  dashboardHome: DashboardHome
}

const dashboardHomeQuery = `
  query DashboardHome {
    dashboardHome {
      summary {
        inboxUnread
        needsReply
        leads
        visits
        pageViews
        searchClicks
        avgLoadMs
      }

      audienceTrend {
        date
        visitors
        pageViews
      }

      inboxPreview {
        id
        source
        status
        kind
        senderName
        senderEmail
        subject
        preview
        createdAt
      }

      contentPulse {
        publishedCount
        draftCount
        latestItems {
          id
          title
          slug
          section
          status
          updatedAt
        }
      }

      readerSignals {
        label
        value
        helper
        icon
      }

      systemHealth {
        key
        label
        status
        helper
      }

      recentActivity {
        id
        type
        title
        description
        createdAt
        href
      }

      quickLinks {
        key
        label
        description
        icon
        to
      }
    }
  }
`

function createDefaultDashboardHome(): DashboardHome {
  return {
    summary: {
      inboxUnread: 0,
      needsReply: 0,
      leads: 0,
      visits: 0,
      pageViews: 0,
      searchClicks: 0,
      avgLoadMs: 0
    },
    audienceTrend: [],
    inboxPreview: [],
    contentPulse: {
      publishedCount: 0,
      draftCount: 0,
      latestItems: []
    },
    readerSignals: [],
    systemHealth: [],
    recentActivity: [],
    quickLinks: []
  }
}

export function useDashboardHome() {
  return useAsyncData<DashboardHome>(
    'dashboard:home',
    async () => {
      const result = await fetchAuthenticatedGraphql<DashboardHomeQuery>(dashboardHomeQuery)
      return result.dashboardHome
    },
    {
      default: createDefaultDashboardHome
    }
  )
}
