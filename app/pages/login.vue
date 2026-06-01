<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import type { AuthInput } from '~~/shared/schemas/auth.schema'

const { t } = useI18n()
const localePath = useLocalePath()
const toast = useToast()
const auth = useAuth()

const state = reactive({
  username: '',
  password: ''
})
const loading = ref(false)

definePageMeta({
  middleware: ['auth']
})

useMohetSeo({
  title: () => t('auth.login.title'),
  description: () => t('auth.login.description')
})

async function onSubmit(event: FormSubmitEvent<AuthInput>) {
  loading.value = true

  try {
    if (import.meta.dev) {
      console.debug('[auth:login:submit]', {
        username: event.data.username,
        hasPassword: Boolean(event.data.password)
      })
    }

    const payload = await auth.login(event.data)
    await navigateTo(localePath(payload.user.role === 'OWNER' ? '/dashboard' : '/member/profile'))
  } catch (error) {
    if (import.meta.dev) {
      console.error('[auth:login:submit-error]', error)
    }

    toast.add({
      color: 'error',
      icon: 'i-lucide-circle-alert',
      title: error instanceof Error ? error.message : t('auth.errors.generic')
    })
  } finally {
    loading.value = false
  }
}

function onFormError(error: unknown) {
  if (import.meta.dev) {
    console.error('[auth:login:form-error]', error)
  }
}
</script>

<template>
  <section class="mx-auto flex min-h-[calc(100vh-12rem)] max-w-md items-center px-4 py-12">
    <UCard
      class="w-full"
      :ui="{
        body: 'p-6 sm:p-8'
      }"
    >
      <div class="mb-8 space-y-2">
        <p class="text-sm font-medium text-primary">{{ t('auth.login.eyebrow') }}</p>
        <h1 class="text-2xl font-semibold tracking-normal text-highlighted">
          {{ t('auth.login.title') }}
        </h1>
        <p class="text-sm leading-6 text-muted">{{ t('auth.login.description') }}</p>
      </div>

      <UForm :state="state" class="space-y-4" :on-submit="onSubmit" @error="onFormError">
        <UFormField name="username" :label="t('auth.fields.username')" required>
          <UInput
            v-model="state.username"
            name="username"
            required
            autocomplete="username"
            icon="i-lucide-user"
            size="lg"
            class="w-full"
          />
        </UFormField>

        <UFormField name="password" :label="t('auth.fields.password')" required>
          <UInput
            v-model="state.password"
            name="password"
            required
            type="password"
            autocomplete="current-password"
            icon="i-lucide-lock"
            size="lg"
            class="w-full"
          />
        </UFormField>

        <div class="flex justify-end">
          <UButton
            :to="localePath('/reset-password')"
            variant="link"
            color="neutral"
            size="sm"
            :label="t('auth.resetPassword.link')"
          />
        </div>

        <UButton
          type="submit"
          block
          size="lg"
          icon="i-lucide-log-in"
          :loading="loading"
          :label="t('auth.login.action')"
        />
      </UForm>

      <template #footer>
        <div class="flex items-center justify-between gap-3 text-sm">
          <span class="text-muted">{{ t('auth.login.noAccount') }}</span>
          <UButton
            :to="localePath('/register')"
            variant="link"
            color="neutral"
            :label="t('auth.register.title')"
          />
        </div>
      </template>
    </UCard>
  </section>
</template>
