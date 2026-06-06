<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const toast = useToast()

const state = reactive({
  username: ''
})
const loading = ref(false)

definePageMeta({
  layout: 'auth',
  middleware: ['auth']
})

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
  <UCard
    class="w-full"
    :ui="{
      body: 'p-6 sm:p-8'
    }"
  >
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
</template>
