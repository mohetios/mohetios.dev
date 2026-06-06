<script setup lang="ts">
type SummaryItem = {
  key: string
  label: string
  value: string | number
  icon: string
  helper?: string
}

defineProps<{
  items: SummaryItem[]
  loading?: boolean
}>()
</script>

<template>
  <section class="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
    <UCard
      v-for="item in items"
      :key="item.key"
      variant="outline"
      :ui="{
        root: 'rounded-2xl',
        body: 'p-3'
      }"
    >
      <div class="flex items-center gap-3">
        <div class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted/60">
          <UIcon :name="item.icon" class="size-4 text-muted" />
        </div>

        <div class="min-w-0">
          <div class="flex items-baseline gap-2">
            <USkeleton
              v-if="loading"
              class="h-7 w-8 shrink-0"
              aria-hidden="true"
            />
            <p v-else class="text-xl font-semibold tracking-tight text-highlighted">
              {{ item.value }}
            </p>
            <p class="truncate text-xs font-medium text-muted">
              {{ item.label }}
            </p>
          </div>

          <p v-if="item.helper" class="mt-0.5 truncate text-xs text-muted">
            {{ item.helper }}
          </p>
        </div>
      </div>
    </UCard>
  </section>
</template>
