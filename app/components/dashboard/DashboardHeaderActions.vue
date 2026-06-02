<script setup lang="ts">
const { t, locale, locales } = useI18n()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()
const auth = useAuth()

const nextLocale = computed(() => {
  return locales.value.find((item) => item.code !== locale.value)
})
const nextLocalePath = computed(() => {
  return nextLocale.value ? switchLocalePath(nextLocale.value.code) : ''
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
    ...(nextLocale.value && nextLocalePath.value
      ? [
          {
            label: nextLocale.value.code.toUpperCase(),
            icon: 'i-lucide-languages',
            to: nextLocalePath.value
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
