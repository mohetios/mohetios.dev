import type { AnalyticsRange, DashboardHomeQuery } from '#gql'

import { DEFAULT_DASHBOARD_RANGE } from '~~/shared/constants/dashboard-range'

export type DashboardHome = DashboardHomeQuery['dashboardHome']

function createDefaultDashboardHome(): DashboardHome {
  return {
    summary: {
      inboxUnread: 0,
      needsReply: 0,
      leads: 0,
      newsletterSubscribers: 0,
      pendingComments: 0,
      visits: 0,
      pageViews: 0,
      searchClicks: 0,
      avgLoadMs: 0
    },
    audienceTrend: [],
    inboxPreview: [],
    readerSignals: [],
    systemHealth: [],
    recentActivity: [],
    quickLinks: []
  }
}

export function useDashboardHome(range?: Ref<AnalyticsRange>) {
  const auth = useAuth()
  auth.restoreToken()

  return useAsyncData<DashboardHome>(
    () => `dashboard:home:${range?.value ?? DEFAULT_DASHBOARD_RANGE}`,
    async () => {
      const result = await GqlDashboardHome({
        range: range?.value ?? DEFAULT_DASHBOARD_RANGE
      })
      return result.dashboardHome
    },
    {
      default: createDefaultDashboardHome,
      dedupe: 'defer',
      watch: range ? [range] : []
    }
  )
}
