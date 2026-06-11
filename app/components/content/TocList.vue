<script setup lang="ts">
import type { TocItem } from '~/utils/content'

const props = defineProps<{
  links: TocItem[]
  nested?: boolean
  ordered?: boolean
}>()

const listTag = computed(() => (props.ordered ? 'ol' : 'ul'))

const listClass = computed(() => {
  if (props.ordered) {
    return 'list-decimal space-y-2 ps-5 text-reader-sm marker:font-medium marker:text-muted'
  }

  if (props.nested) {
    return 'mt-1.5 list-disc space-y-1.5 ps-5 text-reader-sm marker:text-primary/80'
  }

  return 'list-disc space-y-2 ps-5 text-reader-sm marker:text-primary/80'
})
</script>

<template>
  <component :is="listTag" :class="listClass">
    <li v-for="link in links" :key="link.url" class="ps-1">
      <a
        :href="link.url"
        class="text-muted underline-offset-2 transition-colors hover:text-highlighted hover:underline"
      >
        {{ link.title }}
      </a>
      <ContentTocList v-if="link.items?.length" :links="link.items" nested />
    </li>
  </component>
</template>
