<script setup lang="ts">
import type { ContentPulseItem } from '~/data/dashboard.mock'

const props = defineProps<{
  items: ContentPulseItem[]
}>()

const { t } = useI18n()

const statusColor = {
  Published: 'success',
  Draft: 'neutral',
  Scheduled: 'warning'
} as const

function statusLabel(status: ContentPulseItem['status']) {
  const key = status.toLowerCase() as 'published' | 'draft' | 'scheduled'
  return t(`dashboard.overview.contentStatus.${key}`)
}
</script>

<template>
  <DashboardSectionCard
    :title="t('dashboard.overview.contentPulse')"
    to="/blog"
    :link-label="t('dashboard.overview.viewAll')"
    class="h-full"
  >
    <ul class="space-y-3">
      <li
        v-for="item in props.items"
        :key="item.id"
        class="flex items-start justify-between gap-3"
      >
        <div class="min-w-0">
          <p class="truncate text-sm font-medium text-highlighted">
            {{ item.title }}
          </p>
          <p v-if="item.views" class="mt-1 text-xs text-muted">
            {{ item.views }} {{ t('dashboard.overview.views') }}
          </p>
        </div>

        <UBadge
          :color="statusColor[item.status]"
          variant="soft"
          size="xs"
          class="shrink-0 rounded-full"
        >
          {{ statusLabel(item.status) }}
        </UBadge>
      </li>
    </ul>
  </DashboardSectionCard>
</template>
