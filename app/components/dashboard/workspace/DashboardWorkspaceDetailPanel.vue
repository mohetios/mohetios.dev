<script setup lang="ts">
import { dashboardCardUi, inboxWorkspacePanelUi } from '~/utils/dashboard-ui'

defineProps<{
  empty?: boolean
  emptyIcon?: string
  emptyTitle?: string
  emptyDescription?: string
}>()
</script>

<template>
  <UCard
    v-if="!empty"
    :ui="inboxWorkspacePanelUi"
    class="flex min-h-0 flex-col overflow-hidden lg:h-full"
  >
    <template v-if="$slots.header" #header>
      <slot name="header" />
    </template>

    <div class="min-h-0 flex-1 space-y-5 overflow-y-auto">
      <slot />
    </div>
  </UCard>

  <UCard
    v-else
    :ui="dashboardCardUi"
    class="flex min-h-[min(18rem,calc(100dvh-16rem))] items-center justify-center lg:h-full lg:min-h-0"
  >
    <DashboardWorkspaceEmptyState
      :icon="emptyIcon || 'i-lucide-panel-right'"
      :title="emptyTitle || 'Select an item'"
      :description="emptyDescription || 'Choose an item from the list to view details.'"
    />
  </UCard>
</template>
