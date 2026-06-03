<script setup lang="ts">
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
const accountLabel = computed(() => auth.user.value?.username || 'Dashboard user')
const accountDescription = computed(() => auth.user.value?.role || t('dashboard.role'))
const accountMenuItems = computed(() => [
  [
    {
      label: accountLabel.value,
      icon: 'i-lucide-user',
      disabled: true
    },
    {
      label: accountDescription.value,
      icon: 'i-lucide-shield',
      disabled: true
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
</script>

<template>
  <div class="flex items-center justify-center gap-1.5">
    <UDashboardSearchButton collapsed tooltip :kbds="[]" />
    <UColorModeButton color="neutral" variant="ghost" />

    <UDropdownMenu :items="accountMenuItems">
      <UButton
        color="neutral"
        variant="ghost"
        square
        icon="i-lucide-circle-user-round"
        :aria-label="accountLabel"
      />
    </UDropdownMenu>
  </div>
</template>
