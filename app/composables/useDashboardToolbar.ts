import type { Ref } from 'vue'

import {
  DEFAULT_DASHBOARD_RANGE,
  parseDashboardRange,
  type DashboardAnalyticsRange
} from '~~/shared/constants/dashboard-range'
import { getDashboardToolbarPreset } from '~~/shared/constants/dashboard-toolbar-presets'
import { stripLocalePrefix } from '~/utils/content'

const DASHBOARD_RANGE_COOKIE = 'mohetios_dashboard_range'

type DashboardToolbarRuntime = {
  isRefreshing: Ref<boolean>
  refreshHandler: (() => void | Promise<void>) | null
}

type DashboardRangeRuntime = {
  range: Ref<DashboardAnalyticsRange>
}

export function useDashboardToolbarPreset() {
  const route = useRoute()

  return computed(() => getDashboardToolbarPreset(stripLocalePrefix(route.path)))
}

export function useDashboardToolbarRuntime() {
  const nuxtApp = useNuxtApp()

  if (!nuxtApp._dashboardToolbarRuntime) {
    nuxtApp._dashboardToolbarRuntime = {
      isRefreshing: ref(false),
      refreshHandler: null
    } satisfies DashboardToolbarRuntime
  }

  return nuxtApp._dashboardToolbarRuntime as DashboardToolbarRuntime
}

export function useDashboardRangePreference() {
  const nuxtApp = useNuxtApp()
  const stored = useCookie<string>(DASHBOARD_RANGE_COOKIE, {
    default: () => DEFAULT_DASHBOARD_RANGE,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365
  })

  if (!nuxtApp._dashboardRangeRuntime) {
    const range = ref<DashboardAnalyticsRange>(parseDashboardRange(stored.value))

    watch(stored, (value) => {
      const parsed = parseDashboardRange(value)

      if (range.value !== parsed) {
        range.value = parsed
      }
    })

    watch(range, (value) => {
      if (stored.value !== value) {
        stored.value = value
      }
    })

    nuxtApp._dashboardRangeRuntime = { range } satisfies DashboardRangeRuntime
  }

  return (nuxtApp._dashboardRangeRuntime as DashboardRangeRuntime).range
}

export function useDashboardPageToolbar(options: {
  isRefreshing?: Ref<boolean>
  onRefresh: () => void | Promise<void>
}) {
  const runtime = useDashboardToolbarRuntime()
  const pageRefreshing = options.isRefreshing ?? runtime.isRefreshing

  runtime.refreshHandler = options.onRefresh

  watch(
    pageRefreshing,
    (value) => {
      if (runtime.isRefreshing.value !== value) {
        runtime.isRefreshing.value = value
      }
    },
    { immediate: true }
  )

  watch(runtime.isRefreshing, (value) => {
    if (pageRefreshing.value !== value) {
      pageRefreshing.value = value
    }
  })
}
