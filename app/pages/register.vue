<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import type { RegisterInput } from '#gql'

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
  title: () => t('auth.register.title'),
  description: () => t('auth.register.description')
})

async function onSubmit(event: FormSubmitEvent<RegisterInput>) {
  loading.value = true

  try {
    const payload = await auth.register(event.data)
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
            autocomplete="new-password"
            icon="i-lucide-lock"
            size="lg"
            class="w-full"
          />
        </UFormField>

        <UButton
          type="submit"
          block
          size="lg"
          icon="i-lucide-user-plus"
          :loading="loading"
          :label="t('auth.register.action')"
        />
      </UForm>

      <template #footer>
        <div class="flex items-center justify-between gap-3 text-sm">
          <span class="text-muted">{{ t('auth.register.hasAccount') }}</span>
          <UButton
            :to="localePath('/login')"
            variant="link"
            color="neutral"
            :label="t('auth.login.title')"
          />
        </div>
      </template>
  </UCard>
</template>
