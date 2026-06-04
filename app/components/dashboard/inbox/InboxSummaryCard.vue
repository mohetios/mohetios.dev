<script setup lang="ts">
import { dashboardCardUi } from '~/utils/dashboard-ui'

defineProps<{
  label: string
  value: number
  icon: string
  helper: string
}>()
</script>

<template>
  <UCard variant="outline" :ui="dashboardCardUi">
    <div class="flex items-start gap-4">
      <div
        class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
      >
        <UIcon :name="icon" class="size-5" />
      </div>

      <div class="min-w-0 flex-1">
        <p class="text-sm font-medium text-muted">
          {{ label }}
        </p>
        <p class="mt-1 text-3xl font-semibold tracking-tight text-highlighted">
          {{ value }}
        </p>
        <p class="mt-2 text-xs text-muted">
          {{ helper }}
        </p>
      </div>
    </div>
  </UCard>
</template>
