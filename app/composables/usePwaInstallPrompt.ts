// app/composables/usePwaInstallPrompt.ts

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
}

export function usePwaInstallPrompt() {
  const deferredPrompt = shallowRef<BeforeInstallPromptEvent | null>(null)
  const isInstallable = ref(false)
  const isInstalled = ref(false)

  const isStandalone = computed(() => {
    if (!import.meta.client) return false

    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    )
  })

  const isIOS = computed(() => {
    if (!import.meta.client) return false

    return /iphone|ipad|ipod/i.test(window.navigator.userAgent)
  })

  const shouldShowInstallGuide = computed(() => {
    return !isInstalled.value && !isStandalone.value && (isInstallable.value || isIOS.value)
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

  onMounted(() => {
    isInstalled.value = isStandalone.value

    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault()

      deferredPrompt.value = event as BeforeInstallPromptEvent
      isInstallable.value = true
    })

    window.addEventListener('appinstalled', () => {
      deferredPrompt.value = null
      isInstallable.value = false
      isInstalled.value = true
    })
  })

  return {
    isIOS,
    isInstalled,
    isInstallable,
    isStandalone,
    shouldShowInstallGuide,
    promptInstall
  }
}
