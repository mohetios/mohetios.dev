/** Shared Nuxt UI overrides for dashboard cards and surfaces. */
export const dashboardCardUi = {
  root: 'rounded-2xl bg-default shadow-sm ring-1 ring-default',
  header: 'border-b border-default px-4 py-4 sm:px-5',
  body: 'px-4 py-4 sm:px-5'
}

export const dashboardPanelBodyUi = {
  body: 'flex-1 overflow-y-auto bg-muted/20 px-4 py-4 pb-5 sm:px-6 sm:pb-6 lg:px-8'
}

/** Compact scrollable panels for inbox/leads thread list + detail workspace. */
export const inboxThreadPanelUi = {
  root: 'flex h-full min-h-0 flex-col overflow-hidden rounded-2xl',
  header: 'shrink-0 border-b border-default px-4 py-3',
  body: 'flex min-h-0 flex-1 flex-col overflow-hidden !p-0'
}

export const inboxWorkspacePanelUi = {
  root: 'flex h-full min-h-0 flex-col overflow-hidden rounded-2xl',
  header: 'shrink-0 border-b border-default px-4 py-3',
  body: 'flex min-h-0 flex-1 flex-col overflow-hidden p-4'
}
