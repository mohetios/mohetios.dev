<script setup lang="ts">
import type { TocItem } from '~/utils/content'

defineProps<{
  title?: string
  links: TocItem[]
}>()
</script>

<template>
  <nav
    v-if="links.length"
    class="max-w-full overflow-x-auto rounded-xl border border-default bg-muted/20 p-5 sm:p-6"
    :aria-label="title"
  >
    <p v-if="title" class="mohetios-article-section-label mb-4">
      {{ title }}
    </p>
    <ContentTocList :links="links" ordered />
  </nav>
</template>
