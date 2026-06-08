<script setup lang="ts">
import type { DashboardHome } from '~/composables/useDashboardHome'

const props = defineProps<{
  contentPulse: DashboardHome['contentPulse']
  loading?: boolean
}>()

const { t } = useI18n()

const statusColor = {
  published: 'success',
  draft: 'neutral',
  scheduled: 'warning'
} as const

function statusLabel(status: string) {
  const key = status.toLowerCase()

  if (key === 'published' || key === 'draft' || key === 'scheduled') {
    return t(`dashboard.overview.contentStatus.${key}`)
  }

  return status
}
</script>

<template>
  <DashboardSection
    :title="t('dashboard.overview.contentPulse')"
    to="/blog"
    :link-label="t('dashboard.overview.viewAll')"
    class="h-full"
  >
    <div v-if="loading" class="space-y-3">
      <USkeleton v-for="index in 4" :key="index" class="h-10 w-full" />
    </div>

    <template v-else>
      <div class="mb-4 flex gap-4 text-sm">
        <p class="text-muted">
          {{ t('dashboard.home.contentPulse.published') }}:
          <span class="font-medium text-highlighted">{{ contentPulse.publishedCount }}</span>
        </p>
        <p class="text-muted">
          {{ t('dashboard.home.contentPulse.drafts') }}:
          <span class="font-medium text-highlighted">{{ contentPulse.draftCount }}</span>
        </p>
      </div>

      <p v-if="!contentPulse.latestItems.length" class="text-sm text-muted">
        {{ t('dashboard.home.contentPulse.empty') }}
      </p>

      <ul v-else class="space-y-3">
        <li
          v-for="item in props.contentPulse.latestItems"
          :key="item.id"
          class="flex items-start justify-between gap-3"
        >
          <div class="min-w-0">
            <p class="truncate text-sm font-medium text-highlighted">
              {{ item.title }}
            </p>
            <p class="mt-1 text-xs text-muted">
              {{ item.section }}
            </p>
          </div>

          <UBadge
            :color="statusColor[item.status as keyof typeof statusColor] || 'neutral'"
            variant="soft"
            size="xs"
            class="shrink-0 rounded-full"
          >
            {{ statusLabel(item.status) }}
          </UBadge>
        </li>
      </ul>
    </template>
  </DashboardSection>
</template>
