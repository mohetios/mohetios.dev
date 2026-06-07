<script setup lang="ts">
import { formatLeadDate } from '~/utils/lead-normalize'

const model = defineModel<string>('modelValue', { default: '' })

defineProps<{
  disabled?: boolean
}>()

const emit = defineEmits<{
  save: [value: string | null]
  clear: []
}>()

const { t, locale } = useI18n()

function addDays(days: number) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  date.setHours(9, 0, 0, 0)
  return date.toISOString()
}

function applyQuickOption(days: number) {
  const value = addDays(days)
  model.value = value
  emit('save', value)
}

function clearFollowUp() {
  model.value = ''
  emit('clear')
}
</script>

<template>
  <div class="space-y-2">
    <UInput
      v-model="model"
      type="datetime-local"
      size="sm"
      :disabled="disabled"
      @change="emit('save', model || null)"
    />

    <div class="flex flex-wrap gap-2">
      <UButton size="xs" color="neutral" variant="soft" :disabled="disabled" @click="applyQuickOption(1)">
        {{ t('dashboard.leads.followUp.tomorrow') }}
      </UButton>
      <UButton size="xs" color="neutral" variant="soft" :disabled="disabled" @click="applyQuickOption(3)">
        {{ t('dashboard.leads.followUp.inThreeDays') }}
      </UButton>
      <UButton size="xs" color="neutral" variant="soft" :disabled="disabled" @click="applyQuickOption(7)">
        {{ t('dashboard.leads.followUp.nextWeek') }}
      </UButton>
      <UButton size="xs" color="neutral" variant="ghost" :disabled="disabled" @click="clearFollowUp">
        {{ t('dashboard.leads.actions.clearFollowUp') }}
      </UButton>
    </div>

    <p v-if="model" class="text-xs text-muted">
      {{ t('dashboard.leads.detail.nextFollowUp') }}:
      {{ formatLeadDate(Date.parse(model), locale) }}
    </p>
  </div>
</template>
