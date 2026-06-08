<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()
</script>

<template>
  <UEmpty
    icon="i-lucide-file-text"
    :title="title"
    :description="description"
    class="border border-dashed border-default rounded-lg"
  />
</template>
