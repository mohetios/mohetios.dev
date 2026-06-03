type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
}

export default defineNuxtPlugin(() => {
  const deferredPrompt = useState<BeforeInstallPromptEvent | null>(
    'pwa:deferred-install-prompt',
    () => null
  )

  const isInstallable = useState('pwa:is-installable', () => false)
  const isInstalled = useState('pwa:is-installed', () => false)

  const checkStandalone = () => {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true
    )
  }

  isInstalled.value = checkStandalone()

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()

    deferredPrompt.value = event as BeforeInstallPromptEvent
    isInstallable.value = true

    console.info('[pwa] beforeinstallprompt captured')
  })

  window.addEventListener('appinstalled', () => {
    deferredPrompt.value = null
    isInstallable.value = false
    isInstalled.value = true

    console.info('[pwa] app installed')
  })
})
