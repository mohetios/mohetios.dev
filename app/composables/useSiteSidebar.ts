const DESKTOP_MEDIA_QUERY = '(min-width: 1024px)'
const SIDEBAR_STORAGE_KEY = 'mohetios_sidebar_open'

type SidebarPreference = 'open' | 'closed'

function readPreference(): SidebarPreference | null {
  if (!import.meta.client) {
    return null
  }

  const value = localStorage.getItem(SIDEBAR_STORAGE_KEY)
  return value === 'open' || value === 'closed' ? value : null
}

function writePreference(value: SidebarPreference) {
  if (!import.meta.client) {
    return
  }

  localStorage.setItem(SIDEBAR_STORAGE_KEY, value)
}

export function useSiteSidebar() {
  const isDesktop = useState('site-sidebar:is-desktop', () => false)
  const preference = useState<SidebarPreference | null>('site-sidebar:preference', () => null)
  const mobileOpen = useState('site-sidebar:mobile-open', () => false)
  const ready = useState('site-sidebar:ready', () => false)
  const lifecycleReady = useState('site-sidebar:lifecycle-ready', () => false)
  const watchReady = useState('site-sidebar:watch-ready', () => false)

  const desktopOpen = computed(() => preference.value !== 'closed')
  const isSidebarOpen = computed(() => (isDesktop.value ? desktopOpen.value : mobileOpen.value))

  const sidebarPanelClass = computed(() => ({
    'mh-site-sidebar--open': !isDesktop.value && mobileOpen.value,
    'mh-site-sidebar--closed': ready.value && isDesktop.value && !desktopOpen.value
  }))

  const sidebarTogglePositionClass = computed(() => {
    if (isSidebarOpen.value) {
      return 'start-[16.75rem] sm:start-[18.75rem]'
    }

    if (ready.value && isDesktop.value && !desktopOpen.value) {
      return 'start-4'
    }

    return 'start-4 lg:start-[18.75rem]'
  })

  function setDesktopOpen(open: boolean) {
    const next: SidebarPreference = open ? 'open' : 'closed'
    preference.value = next
    writePreference(next)
  }

  function closeSidebar() {
    if (isDesktop.value) {
      setDesktopOpen(false)
      return
    }

    mobileOpen.value = false
  }

  function toggleSidebar() {
    if (isDesktop.value) {
      setDesktopOpen(!desktopOpen.value)
      return
    }

    mobileOpen.value = !mobileOpen.value
  }

  function closeSidebarOnMobile() {
    mobileOpen.value = false
  }

  onMounted(() => {
    if (lifecycleReady.value) {
      return
    }

    lifecycleReady.value = true

    const mediaQuery = window.matchMedia(DESKTOP_MEDIA_QUERY)
    const syncDesktop = () => {
      isDesktop.value = mediaQuery.matches
    }

    preference.value = readPreference()
    syncDesktop()
    ready.value = true
    mediaQuery.addEventListener('change', syncDesktop)

    onBeforeUnmount(() => {
      mediaQuery.removeEventListener('change', syncDesktop)
    })
  })

  if (!watchReady.value) {
    watchReady.value = true

    watch(isDesktop, (desktop) => {
      if (!desktop) {
        mobileOpen.value = false
      }
    })
  }

  return {
    isSidebarOpen,
    sidebarPanelClass,
    sidebarTogglePositionClass,
    toggleSidebar,
    closeSidebar,
    closeSidebarOnMobile
  }
}
