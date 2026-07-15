import type { DropdownMenuItem } from '@nuxt/ui'
import type { SupportedLocale } from '~~/shared/constants/locales'

export function useDashboardAccountMenu() {
  const { t, locale, locales } = useI18n()
  const localePath = useLocalePath()
  const switchLocalePath = useSwitchLocalePath()
  const auth = useAuth()

  const nextLocale = computed(() => {
    return locales.value.find((item) => item.code !== locale.value)
  })
  const nextLocaleLabel = computed(() => {
    if (!nextLocale.value) {
      return ''
    }

    const switchLabelKey = nextLocale.value.switchLabelKey

    return typeof switchLabelKey === 'string'
      ? t(switchLabelKey)
      : nextLocale.value.name || nextLocale.value.code
  })

  const accountLabel = computed(
    () => auth.user.value?.username || t('dashboard.sidebar.accountName')
  )
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
              label: nextLocaleLabel.value,
              icon: 'i-lucide-languages',
              onSelect: () => switchDashboardLocale(nextLocale.value?.code)
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

  async function switchDashboardLocale(code?: SupportedLocale) {
    if (!code) {
      return
    }

    const path = switchLocalePath(code)
    if (path) {
      await navigateTo(path)
    }
  }

  return {
    accountLabel,
    accountRole,
    user,
    accountMenuItems
  }
}
