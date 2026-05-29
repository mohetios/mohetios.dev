<script setup lang="ts">
defineProps<{
  tags?: string[]
  size?: 'xs' | 'sm' | 'md'
}>()

const localePath = useLocalePath()
</script>

<template>
  <div v-if="tags?.length" class="flex flex-wrap gap-2">
    <UBadge
      v-for="tag in tags"
      :key="tag"
      :to="localePath(`/tags/${normalizeTagSlug(tag)}`)"
      color="neutral"
      variant="soft"
      :size="size || 'sm'"
      class="hover:bg-muted"
    >
      {{ tag }}
    </UBadge>
  </div>
</template>
