import type { DashboardHomeQuery } from '#gql'

export type DashboardHome = DashboardHomeQuery['dashboardHome']

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
  const auth = useAuth()
  auth.restoreToken()

  return useAsyncData<DashboardHome>(
    'dashboard:home',
    async () => {
      const result = await GqlDashboardHome()
      return result.dashboardHome
    },
    {
      default: createDefaultDashboardHome
    }
  )
}
