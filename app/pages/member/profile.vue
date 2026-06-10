<script setup lang="ts">
const { t } = useI18n()
const toast = useToast()
const auth = useAuth()

const loading = ref(false)

definePageMeta({
  middleware: ['auth'],
  requiredPermission: 'profile:view'
})

useMohetiosSeo({
  title: () => t('profile.title'),
  description: () => t('profile.description'),
  noindex: true
})

onMounted(async () => {
  if (auth.user.value) {
    return
  }

  loading.value = true

  try {
    await auth.fetchMe()
  } catch (error) {
    toast.add({
      color: 'error',
      icon: 'i-lucide-circle-alert',
      title: error instanceof Error ? error.message : t('auth.errors.generic')
    })
  } finally {
    loading.value = false
  }
})

const roleColor = computed(() => {
  return auth.user.value?.role === 'OWNER' ? 'primary' : 'neutral'
})
</script>

<template>
  <section class="mx-auto w-full max-w-3xl px-4 py-10 sm:py-14">
    <div class="mb-8 space-y-2">
      <p class="text-sm font-medium text-primary">
        {{ t('profile.eyebrow') }}
      </p>

      <h1 class="text-3xl font-semibold tracking-normal text-highlighted">
        {{ t('profile.title') }}
      </h1>

      <p class="max-w-2xl text-sm leading-6 text-muted">
        {{ t('profile.description') }}
      </p>
    </div>

    <UCard :ui="{ body: 'p-5 sm:p-6' }">
      <div v-if="loading" class="flex min-h-48 items-center justify-center">
        <UIcon name="i-lucide-loader-circle" class="size-5 animate-spin text-muted" />
      </div>

      <div v-else class="space-y-6">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div class="flex items-center gap-4">
            <UAvatar :alt="auth.user.value?.username || 'Member'" size="lg" icon="i-lucide-user" />

            <div>
              <p class="text-sm text-muted">
                {{ t('profile.fields.username') }}
              </p>

              <h2 class="mt-1 text-xl font-semibold text-highlighted">
                {{ auth.user.value?.username || '—' }}
              </h2>
            </div>
          </div>

          <UBadge
            :color="roleColor"
            variant="soft"
            :label="auth.user.value?.role || 'GUEST'"
            class="w-fit"
          />
        </div>

        <USeparator />

        <div class="grid gap-4 sm:grid-cols-2">
          <div class="rounded-xl border border-default bg-muted/30 p-4">
            <p class="text-xs font-medium uppercase tracking-wide text-muted">
              {{ t('profile.fields.role') }}
            </p>

            <p class="mt-2 text-sm font-medium text-highlighted">
              {{ auth.user.value?.role || 'GUEST' }}
            </p>
          </div>

          <div class="rounded-xl border border-default bg-muted/30 p-4">
            <p class="text-xs font-medium uppercase tracking-wide text-muted">
              {{ t('profile.status') }}
            </p>

            <p class="mt-2 text-sm font-medium text-highlighted">
              {{
                auth.isAuthenticated.value ? t('auth.status.authenticated') : t('auth.status.guest')
              }}
            </p>
          </div>
        </div>

        <UAlert
          color="warning"
          variant="soft"
          icon="i-lucide-flask-conical"
          :title="t('profile.experimental.title')"
          :description="t('profile.experimental.description')"
        />
      </div>
    </UCard>
  </section>
</template>
