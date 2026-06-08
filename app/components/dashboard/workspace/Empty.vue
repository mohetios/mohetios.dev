<script setup lang="ts">
defineProps<{
  icon: string
  title: string
  description?: string
}>()
</script>

<template>
  <div class="p-8 text-center">
    <div class="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-muted">
      <UIcon :name="icon" class="size-5 text-muted" />
    </div>

    <h3 class="text-sm font-medium text-highlighted">
      {{ title }}
    </h3>

    <p v-if="description" class="mt-1 text-sm text-muted">
      {{ description }}
    </p>
  </div>
</template>
