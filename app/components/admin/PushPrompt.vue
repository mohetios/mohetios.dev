<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const auth = useAuth()
const toast = useToast()
const { ensureSubscribed, isSupported, permission, refreshPermission, subscribe } =
  useAdminPushNotifications()

const busy = ref(false)
const dismissed = useState('admin-push:prompt-dismissed', () => false)
const setupAttempted = useState('admin-push:setup-attempted', () => false)

const pathWithoutLocale = computed(() => stripLocalePrefix(route.path))
const isDashboardRoute = computed(
  () =>
    pathWithoutLocale.value === '/dashboard' || pathWithoutLocale.value.startsWith('/dashboard/')
)
const shouldShow = computed(() => {
  return (
    auth.user.value?.role === 'OWNER' &&
    isSupported.value &&
    permission.value === 'default' &&
    !dismissed.value
  )
})

function getDeviceLabel() {
  if (!import.meta.client) return 'Browser'

  const currentNavigator = navigator as Navigator & {
    userAgentData?: {
      platform?: string
    }
  }

  return currentNavigator.userAgentData?.platform || navigator.platform || 'Browser'
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return t('push.errors.setup')
}

async function restoreOwnerSession() {
  if (auth.user.value || !auth.restoreToken()) {
    return
  }

  await auth.fetchMe().catch(() => undefined)
}

async function syncGrantedSubscription() {
  if (setupAttempted.value || !isSupported.value || auth.user.value?.role !== 'OWNER') {
    return
  }

  setupAttempted.value = true
  refreshPermission()

  if (permission.value !== 'granted') {
    return
  }

  try {
    await ensureSubscribed(getDeviceLabel())
  } catch (error) {
    if (import.meta.dev || isDashboardRoute.value) {
      console.warn('[push:setup-failed]', error)
    }
  }
}

async function enableNotifications() {
  busy.value = true

  try {
    await subscribe(getDeviceLabel())
    dismissed.value = true

    toast.add({
      color: 'success',
      icon: 'i-lucide-bell',
      title: t('push.enabled')
    })
  } catch (error) {
    dismissed.value = true

    toast.add({
      color: 'error',
      icon: 'i-lucide-circle-alert',
      title: getErrorMessage(error)
    })
  } finally {
    busy.value = false
  }
}

onMounted(async () => {
  if (!isSupported.value) {
    return
  }

  refreshPermission()
  await restoreOwnerSession()
  await syncGrantedSubscription()
})

watch(
  () => auth.user.value?.role,
  async (role) => {
    if (role === 'OWNER') {
      await syncGrantedSubscription()
    }
  }
)
</script>

<template>
  <ClientOnly>
    <UCard
      v-if="shouldShow"
      class="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm shadow-lg sm:left-auto"
      :ui="{ body: 'p-4' }"
    >
      <div class="space-y-4">
        <div class="flex items-start gap-3">
          <div
            class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
          >
            <UIcon name="i-lucide-bell" class="size-4" />
          </div>

          <div class="min-w-0">
            <p class="text-sm font-medium text-highlighted">{{ t('push.title') }}</p>
            <p class="mt-1 text-sm leading-6 text-muted">{{ t('push.description') }}</p>
          </div>
        </div>

        <div class="flex justify-end gap-2">
          <UButton color="neutral" variant="ghost" size="sm" @click="() => { dismissed = true }">
            {{ t('push.later') }}
          </UButton>

          <UButton size="sm" icon="i-lucide-bell" :loading="busy" @click="enableNotifications">
            {{ t('push.enable') }}
          </UButton>
        </div>
      </div>
    </UCard>
  </ClientOnly>
</template>
