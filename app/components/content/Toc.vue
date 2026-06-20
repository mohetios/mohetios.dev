<script setup lang="ts">
import type { TocItem } from '~/utils/content'

defineProps<{
  title?: string
  links: TocItem[]
  compact?: boolean
}>()
</script>

<template>
  <nav v-if="links.length" class="space-y-3" :aria-label="title">
    <p v-if="title" class="mh-kicker text-muted">
      {{ title }}
    </p>
    <ContentTocList :links="links" ordered :compact="compact" />
  </nav>
</template>
