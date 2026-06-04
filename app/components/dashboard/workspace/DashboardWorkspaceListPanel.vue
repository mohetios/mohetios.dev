<script setup lang="ts">
import { inboxThreadPanelUi } from '~/utils/dashboard-ui'

defineProps<{
  title: string
  description?: string
  loading?: boolean
  empty?: boolean
  emptyTitle?: string
  emptyDescription?: string
  emptyIcon?: string
  skeletonCount?: number
  /** Taller list panel: near full viewport when stacked; fills column on desktop. */
  fillHeight?: boolean
  /** Edge-to-edge list rows (no horizontal inset on list body). */
  flushList?: boolean
}>()
</script>

<template>
  <UCard
    :ui="inboxThreadPanelUi"
    class="flex min-h-0 flex-col overflow-hidden lg:h-full"
    :class="fillHeight ? 'min-h-[calc(100dvh-14rem)] lg:min-h-0' : undefined"
  >
    <template #header>
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <h2 class="truncate text-sm font-semibold text-highlighted">
            {{ title }}
          </h2>

          <p v-if="description" class="truncate text-xs text-muted">
            {{ description }}
          </p>
        </div>

        <slot name="header-actions" />
      </div>
    </template>

    <div class="flex min-h-0 flex-1 flex-col">
      <div
        v-if="loading"
        class="min-h-0 flex-1 overflow-y-auto"
        :class="flushList ? 'space-y-0' : 'space-y-2 p-3'"
      >
        <USkeleton
          v-for="item in skeletonCount || 6"
          :key="item"
          class="h-20 w-full"
          :class="flushList ? 'rounded-none' : 'rounded-xl'"
        />
      </div>

      <div
        v-else-if="empty"
        class="flex min-h-0 flex-1 flex-col items-center justify-center"
      >
        <DashboardWorkspaceEmptyState
          :icon="emptyIcon || 'i-lucide-inbox'"
          :title="emptyTitle || 'Nothing found'"
          :description="emptyDescription || 'Try a different search or filter.'"
        />
      </div>

      <div v-else class="min-h-0 flex-1 overflow-y-auto">
        <slot />
      </div>
    </div>
  </UCard>
</template>
