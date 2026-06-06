<script setup lang="ts">
type StatItem = {
  key: string
  label: string
  value: string
  icon: string
}

defineProps<{
  items: StatItem[]
  loading?: boolean
}>()
</script>

<template>
  <div v-if="loading" class="grid gap-3 sm:grid-cols-3">
    <USkeleton v-for="index in 3" :key="index" class="h-20 w-full rounded-xl" />
  </div>

  <div v-else class="grid gap-3 sm:grid-cols-3">
    <div
      v-for="item in items"
      :key="item.key"
      class="rounded-xl border border-default bg-muted/20 p-3"
    >
      <div class="flex items-center gap-1.5 text-xs text-muted">
        <UIcon :name="item.icon" class="size-3.5" />
        {{ item.label }}
      </div>
      <p class="mt-1 text-lg font-semibold text-highlighted">
        {{ item.value }}
      </p>
    </div>
  </div>
</template>
