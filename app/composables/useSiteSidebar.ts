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
  const desktopPreference = useState<SidebarPreference | null>('site-sidebar:preference', () => null)
  const mobileOpen = useState('site-sidebar:mobile-open', () => false)
  const initialized = useState('site-sidebar:initialized', () => false)
  const mediaCleanup = useState<null | (() => void)>('site-sidebar:media-cleanup', () => null)

  const desktopOpen = computed(() => desktopPreference.value !== 'closed')
  const isSidebarOpen = computed(() => (isDesktop.value ? desktopOpen.value : mobileOpen.value))

  const sidebarTogglePositionClass = computed(() => {
    if (!isDesktop.value) {
      return 'start-4'
    }

    if (isSidebarOpen.value) {
      return 'start-[16.75rem] sm:start-[18.75rem]'
    }

    return 'start-4 lg:start-[18.75rem]'
  })

  function setDesktopOpen(open: boolean) {
    const next: SidebarPreference = open ? 'open' : 'closed'
    desktopPreference.value = next
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
    if (!initialized.value) {
      initialized.value = true
      desktopPreference.value = readPreference()

      const mediaQuery = window.matchMedia(DESKTOP_MEDIA_QUERY)
      const syncDesktop = () => {
        isDesktop.value = mediaQuery.matches
      }

      syncDesktop()
      mediaQuery.addEventListener('change', syncDesktop)
      mediaCleanup.value = () => {
        mediaQuery.removeEventListener('change', syncDesktop)
      }

      watch(isDesktop, (desktop) => {
        if (desktop) {
          mobileOpen.value = false
        }
      })
    }
  })

  onBeforeUnmount(() => {
    mediaCleanup.value?.()
    mediaCleanup.value = null
    initialized.value = false
  })

  return {
    isDesktop,
    desktopOpen,
    mobileOpen,
    isSidebarOpen,
    sidebarTogglePositionClass,
    toggleSidebar,
    closeSidebar,
    setDesktopOpen,
    closeSidebarOnMobile
  }
}
