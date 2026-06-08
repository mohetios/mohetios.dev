<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import type { LoginInput, RegisterInput } from '#gql'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const toast = useToast()
const auth = useAuth()

type TurnstileWidget = {
  reset: () => void
}

const state = reactive({
  username: '',
  password: ''
})
const loading = ref(false)
const turnstile = ref<TurnstileWidget | null>(null)
const turnstileToken = ref('')

definePageMeta({
  layout: 'auth',
  middleware: ['auth']
})

const { data: setupAvailable, pending: setupPending } = await useAsyncData(
  'auth:setup-available',
  async () => {
    const result = await GqlAuthSetupAvailable()

    return result.authSetupAvailable
  },
  {
    server: false,
    default: () => false
  }
)

const isSetupMode = computed(() => setupAvailable.value === true)

const turnstileAction = computed(() => (isSetupMode.value ? 'auth_setup' : 'auth_login'))

useMohetSeo({
  title: () => (isSetupMode.value ? t('auth.register.title') : t('auth.login.title')),
  description: () =>
    isSetupMode.value ? t('auth.register.description') : t('auth.login.description')
})

async function onSubmit(event: FormSubmitEvent<LoginInput | RegisterInput>) {
  if (!turnstileToken.value) {
    toast.add({
      color: 'error',
      icon: 'i-lucide-shield-alert',
      title: t('auth.errors.verificationTitle'),
      description: t('auth.errors.verificationDescription')
    })

    return
  }

  loading.value = true

  try {
    const input = {
      ...event.data,
      turnstileToken: turnstileToken.value
    }

    const payload = isSetupMode.value ? await auth.register(input) : await auth.login(input)

    await navigateTo(payload.user.role === 'OWNER' ? '/dashboard' : localePath('/member/profile'))
  } catch (error) {
    toast.add({
      color: 'error',
      icon: 'i-lucide-circle-alert',
      title: error instanceof Error ? error.message : t('auth.errors.generic')
    })

    turnstileToken.value = ''
    turnstile.value?.reset()
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
          :autocomplete="isSetupMode ? 'new-password' : 'current-password'"
          icon="i-lucide-lock"
          size="lg"
          class="w-full"
        />
      </UFormField>

      <NuxtTurnstile
        ref="turnstile"
        v-model="turnstileToken"
        :options="{
          action: turnstileAction,
          theme: 'auto',
          language: locale
        }"
      />

      <UButton
        type="submit"
        block
        size="lg"
        :icon="isSetupMode ? 'i-lucide-user-plus' : 'i-lucide-log-in'"
        :loading="loading || setupPending"
        :disabled="!turnstileToken"
        :label="isSetupMode ? t('auth.register.action') : t('auth.login.action')"
      />
    </UForm>
  </UCard>
</template>
