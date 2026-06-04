import type { DropdownMenuItem } from '@nuxt/ui'

export function useDashboardAccountMenu() {
  const { t, locale, locales, loadLocaleMessages } = useI18n()
  const localePath = useLocalePath()
  const auth = useAuth()
  const localeCookie = useCookie<typeof locale.value | null>('mohetios_locale', {
    path: '/',
    sameSite: 'lax'
  })

  const nextLocale = computed(() => {
    return locales.value.find((item) => item.code !== locale.value)
  })

  const accountLabel = computed(() => auth.user.value?.username || t('dashboard.sidebar.accountName'))
  const accountRole = computed(() => auth.user.value?.role || t('dashboard.sidebar.accountRole'))

  const user = computed(() => ({
    name: accountLabel.value,
    avatar: {
      alt: accountLabel.value,
      icon: 'i-lucide-user'
    }
  }))

  const accountMenuItems = computed<DropdownMenuItem[][]>(() => [
    [
      {
        type: 'label',
        label: accountLabel.value,
        description: accountRole.value,
        avatar: user.value.avatar
      }
    ],
    [
      {
        label: t('dashboard.backToSite'),
        icon: 'i-lucide-house',
        to: localePath('/')
      },
      ...(nextLocale.value
        ? [
            {
              label: nextLocale.value.code.toUpperCase(),
              icon: 'i-lucide-languages',
              onSelect: () => switchDashboardLocale(nextLocale.value?.code as typeof locale.value)
            }
          ]
        : []),
      {
        label: t('auth.logout'),
        icon: 'i-lucide-log-out',
        onSelect: logout
      }
    ]
  ])

  async function logout() {
    await auth.logout()
    await navigateTo(localePath('/login'))
  }

  async function switchDashboardLocale(code?: typeof locale.value) {
    if (!code) {
      return
    }

    await loadLocaleMessages(code)
    localeCookie.value = code
    locale.value = code
  }

  return {
    accountLabel,
    accountRole,
    user,
    accountMenuItems
  }
}
