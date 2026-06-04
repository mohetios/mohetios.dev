type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
}

export function usePwaInstallPrompt() {
  const deferredPrompt = useState<BeforeInstallPromptEvent | null>(
    'pwa:deferred-install-prompt',
    () => null
  )

  const isInstallable = useState('pwa:is-installable', () => false)
  const isInstalled = useState('pwa:is-installed', () => false)

  const isStandalone = computed(() => {
    if (!import.meta.client) return false

    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true
    )
  })

  const isIOS = computed(() => {
    if (!import.meta.client) return false

    return /iphone|ipad|ipod/i.test(window.navigator.userAgent)
  })

  const canShowManualInstallGuide = computed(() => {
    return !isInstalled.value && !isStandalone.value && isIOS.value
  })

  const shouldShowInstallGuide = computed(() => {
    return (
      !isInstalled.value &&
      !isStandalone.value &&
      (isInstallable.value || canShowManualInstallGuide.value)
    )
  })

  async function promptInstall() {
    if (!deferredPrompt.value) {
      return {
        supported: false,
        outcome: 'unavailable' as const
      }
    }

    const promptEvent = deferredPrompt.value

    deferredPrompt.value = null
    isInstallable.value = false

    await promptEvent.prompt()

    const choice = await promptEvent.userChoice

    return {
      supported: true,
      outcome: choice.outcome
    }
  }

  return {
    isIOS,
    isInstalled,
    isInstallable,
    isStandalone,
    shouldShowInstallGuide,
    promptInstall
  }
}
