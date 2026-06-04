/** Shared Nuxt UI overrides for dashboard cards and surfaces. */
export const dashboardCardUi = {
  root: 'rounded-2xl bg-default shadow-sm ring-1 ring-default',
  header: 'border-b border-default px-4 py-4 sm:px-5',
  body: 'px-4 py-4 sm:px-5'
}

export const dashboardPanelBodyUi = {
  body: 'flex-1 overflow-y-auto bg-muted/20 px-4 py-4 sm:px-6 lg:px-8'
}

/** Tall scrollable panels for inbox thread list + workspace. */
export const inboxThreadPanelUi = {
  root: 'flex min-h-[calc(100dvh-15rem)] max-h-[calc(100dvh-12rem)] flex-col lg:h-full lg:min-h-0 lg:max-h-none',
  body: 'min-h-0 flex-1 overflow-y-auto p-0'
}

export const inboxWorkspacePanelUi = {
  root: 'flex min-h-[calc(100dvh-15rem)] max-h-[calc(100dvh-12rem)] flex-col lg:h-full lg:min-h-0 lg:max-h-none',
  body: 'min-h-0 flex-1 overflow-y-auto'
}
