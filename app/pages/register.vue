<script setup lang="ts">
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
  title: () => t('auth.register.title'),
  description: () => t('auth.register.description')
})

async function onSubmit() {
  loading.value = true

  try {
    await auth.register(state)
    await navigateTo(localePath('/dashboard'))
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
  <section class="mx-auto flex min-h-[calc(100vh-12rem)] max-w-md items-center px-4 py-12">
    <UCard
      class="w-full"
      :ui="{
        body: 'p-6 sm:p-8'
      }"
    >
      <div class="mb-8 space-y-2">
        <p class="text-sm font-medium text-primary">{{ t('auth.register.eyebrow') }}</p>
        <h1 class="text-2xl font-semibold tracking-normal text-highlighted">
          {{ t('auth.register.title') }}
        </h1>
        <p class="text-sm leading-6 text-muted">{{ t('auth.register.description') }}</p>
      </div>

      <UForm :state="state" class="space-y-4" @submit="onSubmit">
        <UFormField name="username" :label="t('auth.fields.username')" required>
          <UInput
            v-model="state.username"
            autocomplete="username"
            icon="i-lucide-user"
            size="lg"
            class="w-full"
          />
        </UFormField>

        <UFormField name="password" :label="t('auth.fields.password')" required>
          <UInput
            v-model="state.password"
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
  </section>
</template>
