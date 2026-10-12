import type { DropdownMenuItem } from '@nuxt/ui'
export function useDashboardAccountMenu() {
  const { t, locale, locales } = useI18n()
  const localePath = useLocalePath()
  const switchLocalePath = useSwitchLocalePath()
  const auth = useAuth()

  const nextLocale = computed(() => locales.value.find((item) => item.code !== locale.value))

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
              label: nextLocale.value.name,
              icon: 'i-lucide-languages',
              to: switchLocalePath(nextLocale.value.code)
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

  return {
    accountLabel,
    accountRole,
    user,
    accountMenuItems
  }
}
