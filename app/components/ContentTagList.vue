<script setup lang="ts">
defineProps<{
  tags?: string[]
  size?: 'xs' | 'sm' | 'md'
}>()
</script>

<template>
  <div v-if="tags?.length" class="flex flex-wrap gap-2">
    <UBadge v-for="tag in tags" :key="tag" color="neutral" variant="soft" :size="size || 'sm'">
      {{ tag }}
    </UBadge>
  </div>
</template>
