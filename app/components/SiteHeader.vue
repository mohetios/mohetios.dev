<script setup lang="ts">
const { locale, locales, t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const auth = useAuth()
const isCheckingAuth = ref(false)

const navigation = computed(() => [
  { label: t('nav.home'), to: localePath('/') },
  { label: t('nav.blog'), to: localePath('/blog') },
  { label: t('nav.lab'), to: localePath('/lab') },
  { label: t('nav.projects'), to: localePath('/projects') },
  { label: t('nav.about'), to: localePath('/about') }
])

const nextLocale = computed(
  () => locales.value.find((item) => item.code !== locale.value) || locales.value[0]
)
const nextLocalePath = computed(() =>
  nextLocale.value
    ? getLocalizedRoutePath(route.path, nextLocale.value.code, { fallbackToSection: true })
    : undefined
)

const accountItems = computed(() => {
  if (auth.user.value) {
    const items: Array<{
      label: string
      icon: string
      disabled?: boolean
      to?: string
      onSelect?: () => Promise<void>
    }> = [
      {
        label: auth.user.value.username,
        icon: 'i-lucide-user',
        disabled: true
      },
      {
        label: t('nav.profile'),
        icon: 'i-lucide-circle-user-round',
        to: localePath('/member/profile')
      }
    ]

    if (auth.can('dashboard:view')) {
      items.push({
        label: t('nav.dashboard'),
        icon: 'i-lucide-layout-dashboard',
        to: localePath('/dashboard')
      })
    }

    items.push({
      label: t('auth.logout'),
      icon: 'i-lucide-log-out',
      onSelect: logout
    })

    return [
      items
    ]
  }

  return [
    [
      {
        label: t('auth.login.title'),
        icon: 'i-lucide-log-in',
        to: localePath('/login')
      },
      {
        label: t('auth.register.title'),
        icon: 'i-lucide-user-plus',
        to: localePath('/register')
      }
    ]
  ]
})

onMounted(async () => {
  auth.restoreToken()

  if (!auth.token.value || auth.user.value) {
    return
  }

  isCheckingAuth.value = true

  try {
    await auth.fetchMe()
  } catch {
    auth.clearToken()
  } finally {
    isCheckingAuth.value = false
  }
})

async function logout() {
  await auth.logout()
  await navigateTo(localePath('/login'))
}
</script>

<template>
  <UHeader
    :title="t('site.name')"
    :to="localePath('/')"
    mode="slideover"
    :ui="{
      root: 'border-b border-default bg-default/90 backdrop-blur'
    }"
  >
    <template #left>
      <NuxtLink
        :to="localePath('/')"
        class="flex items-center gap-2 font-semibold tracking-tight"
        :aria-label="t('site.name')"
      >
        <span class="logo-mark">{{ t('site.name') }}</span>
      </NuxtLink>
    </template>

    <UNavigationMenu :items="navigation" variant="link" class="hidden lg:flex" />

    <template #right>
      <UDropdownMenu :items="accountItems">
        <UButton
          color="neutral"
          variant="ghost"
          icon="i-lucide-circle-user-round"
          :loading="isCheckingAuth"
          :aria-label="auth.user.value ? t('nav.dashboard') : t('auth.login.title')"
        />
      </UDropdownMenu>

      <UButton
        v-if="nextLocale && nextLocalePath"
        :to="nextLocalePath"
        color="neutral"
        variant="ghost"
        icon="i-lucide-languages"
        :label="nextLocale.code.toUpperCase()"
        class="cursor-pointer"
      />
      <UColorModeButton />
    </template>

    <template #body>
      <UNavigationMenu :items="navigation" orientation="vertical" variant="link" class="-mx-2" />
    </template>
  </UHeader>
</template>
