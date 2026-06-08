<script setup lang="ts">
const open = defineModel<boolean>('open', { required: true })

defineProps<{
  title: string
  description: string
  confirmLabel: string
  destructive?: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const { t } = useI18n()
</script>

<template>
  <UModal v-model:open="open">
    <template #content>
      <div class="space-y-4 p-6">
        <div>
          <h3 class="text-base font-semibold text-highlighted">
            {{ title }}
          </h3>
          <p class="mt-2 text-sm text-muted">
            {{ description }}
          </p>
        </div>

        <div class="flex justify-end gap-2">
          <UButton color="neutral" variant="ghost" @click="emit('cancel')">
            {{ t('dashboard.inbox.confirmCancel') }}
          </UButton>
          <UButton
            :color="destructive ? 'error' : 'primary'"
            :loading="loading"
            @click="emit('confirm')"
          >
            {{ confirmLabel }}
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>
