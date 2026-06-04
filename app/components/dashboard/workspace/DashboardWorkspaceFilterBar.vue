<script setup lang="ts">
defineProps<{
  compact?: boolean
}>()
</script>

<template>
  <section
    class="rounded-2xl border border-default bg-default/80 p-2 shadow-xs backdrop-blur"
  >
    <div class="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
      <div v-if="$slots.filters" class="flex min-w-0 flex-wrap items-center gap-2">
        <slot name="filters" />
      </div>

      <div v-if="$slots.search" class="w-full lg:w-80">
        <slot name="search" />
      </div>
    </div>
  </section>
</template>
