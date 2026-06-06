<script setup lang="ts">
type ProgressItem = {
  label: string
  value: number
  share: number
  helper?: string
  code?: string
}

const props = defineProps<{
  items: ProgressItem[]
  maxItems?: number
  valueFormatter?: (value: number) => string
  loading?: boolean
}>()

const visibleItems = computed(() => props.items.slice(0, props.maxItems ?? 10))

function formatValue(value: number) {
  return props.valueFormatter ? props.valueFormatter(value) : String(value)
}
</script>

<template>
  <div v-if="loading" class="space-y-4">
    <USkeleton v-for="index in 4" :key="index" class="h-10 w-full" />
  </div>

  <p v-else-if="!visibleItems.length" class="py-6 text-center text-sm text-muted">
    <slot name="empty" />
  </p>

  <ul v-else class="space-y-4">
    <li v-for="item in visibleItems" :key="item.label">
      <div class="flex items-center justify-between gap-3 text-sm">
        <span class="flex min-w-0 items-center gap-2 font-medium text-highlighted">
          <span
            v-if="item.code"
            class="rounded bg-muted/60 px-1.5 py-0.5 text-xs font-medium text-muted"
          >
            {{ item.code }}
          </span>
          <span class="truncate">{{ item.label }}</span>
        </span>
        <span class="shrink-0 text-muted">
          {{ formatValue(item.value) }}<template v-if="item.helper"> · {{ item.helper }}</template>
        </span>
      </div>
      <UProgress :model-value="item.share" :max="100" size="sm" class="mt-2" />
    </li>
  </ul>
</template>
