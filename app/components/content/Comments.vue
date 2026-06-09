<script setup lang="ts">
import type { CommentTargetType } from '~~/shared/constants/comments'

defineProps<{
  targetType: CommentTargetType
  targetPath: string
  targetTitle: string
}>()
</script>

<template>
  <ClientOnly>
    <CommentsBlock :target-type="targetType" :target-path="targetPath" :target-title="targetTitle" />

    <template #fallback>
      <CommentsBlockPlaceholder />
    </template>
  </ClientOnly>
</template>
