/** Shared Nuxt UI overrides for dashboard cards and surfaces. */
export const dashboardCardUi = {
  root: 'rounded-2xl bg-default shadow-sm ring-1 ring-default',
  header: 'border-b border-default px-4 py-4 sm:px-5',
  body: 'px-4 py-4 sm:px-5'
}

/** Minimum card height for dashboard chart panels in grid layouts. */
export const dashboardChartCardMinHeightClass = 'min-h-[28rem]'

/** Fixed height for a standalone dashboard chart panel (e.g. content tab). */
export const dashboardChartStandaloneHeightClass = 'h-[30rem]'

/** Default chart canvas height before container measurement completes. */
export const dashboardChartMinHeightPx = 360

/** Cards whose body should stretch and host a full-height chart. */
export const dashboardChartCardUi = {
  root: 'flex h-full min-h-0 flex-col rounded-2xl bg-default shadow-sm ring-1 ring-default',
  header: 'shrink-0 border-b border-default px-4 py-4 sm:px-5',
  body: 'flex min-h-0 flex-1 flex-col overflow-hidden px-4 py-4 sm:px-5'
}

export const dashboardPanelBodyUi = {
  body: 'flex-1 overflow-y-auto bg-muted/20 px-4 py-4 pb-5 sm:px-6 sm:pb-6 lg:px-8'
}
