<script setup lang="ts">
import type { TocItem } from '~/utils/content'

defineProps<{
  title?: string
  links: TocItem[]
}>()
</script>

<template>
  <nav v-if="links.length" class="space-y-3" :aria-label="title">
    <p
      v-if="title"
      class="text-sm font-medium tracking-[0.14em] text-muted uppercase rtl:normal-case rtl:tracking-normal"
    >
      {{ title }}
    </p>
    <ContentTocList :links="links" ordered />
  </nav>
</template>
