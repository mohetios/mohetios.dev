<script setup lang="ts">
import type { InboxPreviewItem } from '~/data/dashboard.mock'

defineProps<{
  items: InboxPreviewItem[]
}>()

const { t } = useI18n()
</script>

<template>
  <DashboardSectionCard
    :title="t('dashboard.overview.inboxPreview')"
    to="/dashboard/inbox"
    :link-label="t('dashboard.overview.viewAll')"
    class="h-full"
  >
    <ul class="divide-y divide-default">
      <li
        v-for="item in items"
        :key="item.id"
        class="flex gap-3 py-3 first:pt-0 last:pb-0"
      >
        <div class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted/60">
          <UIcon :name="item.icon" class="size-4 text-muted" />
        </div>

        <div class="min-w-0 flex-1">
          <div class="flex items-start justify-between gap-2">
            <p class="truncate text-sm font-medium text-highlighted">
              {{ item.title }}
            </p>
            <span class="shrink-0 text-xs text-muted">{{ item.time }}</span>
          </div>

          <p class="mt-0.5 text-xs text-muted">
            {{ item.source }}
          </p>

          <p class="mt-1 line-clamp-2 text-sm text-muted">
            {{ item.preview }}
          </p>

          <UBadge
            v-if="item.badge"
            :color="item.badge.color"
            variant="soft"
            size="xs"
            class="mt-2 rounded-full"
          >
            {{ item.badge.label }}
          </UBadge>
        </div>
      </li>
    </ul>
  </DashboardSectionCard>
</template>
