<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const toast = useToast()

const state = reactive({
  email: ''
})
const loading = ref(false)

useMohetSeo({
  title: () => t('auth.resetPassword.title'),
  description: () => t('auth.resetPassword.description')
})

async function onSubmit() {
  loading.value = true

  try {
    toast.add({
      color: 'neutral',
      icon: 'i-lucide-mail-check',
      title: t('auth.resetPassword.sentTitle'),
      description: t('auth.resetPassword.sentDescription')
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
        <p class="text-sm font-medium text-primary">{{ t('auth.resetPassword.eyebrow') }}</p>
        <h1 class="text-2xl font-semibold tracking-normal text-highlighted">
          {{ t('auth.resetPassword.title') }}
        </h1>
        <p class="text-sm leading-6 text-muted">{{ t('auth.resetPassword.description') }}</p>
      </div>

      <UForm :state="state" class="space-y-4" @submit="onSubmit">
        <UFormField name="email" :label="t('auth.fields.email')" required>
          <UInput
            v-model="state.email"
            type="email"
            autocomplete="email"
            icon="i-lucide-mail"
            size="lg"
            class="w-full"
          />
        </UFormField>

        <UButton
          type="submit"
          block
          size="lg"
          icon="i-lucide-send"
          :loading="loading"
          :label="t('auth.resetPassword.action')"
        />
      </UForm>

      <template #footer>
        <div class="flex items-center justify-between gap-3 text-sm">
          <span class="text-muted">{{ t('auth.resetPassword.remembered') }}</span>
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
