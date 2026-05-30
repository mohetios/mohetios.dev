<script setup lang="ts">
const props = defineProps<{
  date?: string | Date
  updated?: string | Date
  status?: string
  readingTime?: string
}>()

const { locale, t } = useI18n()

function formatDate(date?: string | Date) {
  if (!date) {
    return ''
  }

  return new Date(date).toLocaleDateString(locale.value, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const showUpdated = computed(
  () =>
    props.updated &&
    (!props.date || new Date(props.updated).getTime() !== new Date(props.date).getTime())
)
</script>

<template>
  <div class="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted">
    <UBadge v-if="status" color="neutral" variant="outline" size="sm">
      {{ status }}
    </UBadge>

    <time v-if="date" :datetime="new Date(date).toISOString()">
      {{ formatDate(date) }}
    </time>

    <span v-if="showUpdated" class="inline-flex items-center gap-1">
      <span>{{ t('content.updated') }}</span>
      <time :datetime="new Date(updated!).toISOString()">{{ formatDate(updated) }}</time>
    </span>

    <span v-if="readingTime">{{ readingTime }}</span>
  </div>
</template>
