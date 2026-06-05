<script setup lang="ts">
import { estimateReadingTimeFromHtml } from '~/utils/content-reading-time'

const props = defineProps<{
  kind: 'blog' | 'lab' | 'project'
  date?: string | Date
  updated?: string | Date
  status?: string
  tags?: string[]
  projectRepo?: string
  projectWebsite?: string
  content?: string
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

const readingMinutes = computed(() => estimateReadingTimeFromHtml(props.content))

const tagLabel = computed(() =>
  props.kind === 'project' ? t('content.meta.stack') : t('content.meta.tags')
)
</script>

<template>
  <UCard variant="subtle">
    <div class="space-y-4">
      <div v-if="status">
        <p class="text-ui-xs font-medium uppercase tracking-widest text-muted">
          {{ t('content.meta.status') }}
        </p>
        <p class="mt-1 text-ui-sm font-medium text-highlighted">
          {{ status }}
        </p>
      </div>

      <div v-if="date">
        <p class="text-ui-xs font-medium uppercase tracking-widest text-muted">
          {{ kind === 'project' ? t('content.meta.started') : t('content.meta.published') }}
        </p>
        <p class="mt-1 text-ui-sm font-medium text-highlighted">
          <time :datetime="new Date(date).toISOString()">{{ formatDate(date) }}</time>
        </p>
      </div>

      <div v-if="showUpdated">
        <p class="text-ui-xs font-medium uppercase tracking-widest text-muted">
          {{ t('content.meta.updated') }}
        </p>
        <p class="mt-1 text-ui-sm font-medium text-highlighted">
          <time :datetime="new Date(updated!).toISOString()">{{ formatDate(updated) }}</time>
        </p>
      </div>

      <div>
        <p class="text-ui-xs font-medium uppercase tracking-widest text-muted">
          {{ t('content.meta.readingTime') }}
        </p>
        <p class="mt-1 text-ui-sm font-medium text-highlighted">
          {{ t('content.meta.readingTimeValue', { count: readingMinutes }) }}
        </p>
      </div>

      <div v-if="tags?.length">
        <p class="text-ui-xs font-medium uppercase tracking-widest text-muted">
          {{ tagLabel }}
        </p>
        <ContentTagList class="mt-2" :tags="tags" />
      </div>

      <div
        v-if="kind === 'project' && (projectRepo || projectWebsite)"
        class="flex flex-wrap gap-2 pt-1"
      >
        <UButton
          v-if="projectRepo"
          :to="projectRepo"
          color="neutral"
          variant="subtle"
          icon="i-lucide-github"
          target="_blank"
        >
          {{ t('content.meta.repository') }}
        </UButton>
        <UButton
          v-if="projectWebsite"
          :to="projectWebsite"
          color="neutral"
          variant="subtle"
          icon="i-lucide-external-link"
          target="_blank"
        >
          {{ t('content.meta.website') }}
        </UButton>
      </div>
    </div>
  </UCard>
</template>
