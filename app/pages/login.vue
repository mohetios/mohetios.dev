<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import type { LoginInput } from '#gql'

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
  layout: 'auth',
  middleware: ['auth']
})

useMohetSeo({
  title: () => t('auth.login.title'),
  description: () => t('auth.login.description')
})

async function onSubmit(event: FormSubmitEvent<LoginInput>) {
  loading.value = true

  try {
    const payload = await auth.login(event.data)
    await navigateTo(payload.user.role === 'OWNER' ? '/dashboard' : localePath('/member/profile'))
  } catch (error) {
    toast.add({
      color: 'error',
      icon: 'i-lucide-circle-alert',
      title: error instanceof Error ? error.message : t('auth.errors.generic')
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UCard
    class="w-full"
    :ui="{
      body: 'p-6 sm:p-8'
    }"
  >
    <UForm :state="state" class="space-y-4" :on-submit="onSubmit">
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
</template>
