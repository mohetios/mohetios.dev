<script setup lang="ts">
import type { TocItem } from '~/utils/content'

const props = defineProps<{
  links: TocItem[]
  nested?: boolean
  ordered?: boolean
  compact?: boolean
}>()

const listTag = computed(() => (props.ordered ? 'ol' : 'ul'))

const listClass = computed(() => {
  if (props.ordered) {
    if (props.compact) {
      return 'list-none space-y-2 ps-0 text-[0.95rem] leading-6'
    }

    return 'list-decimal space-y-2 ps-5 text-base leading-7 marker:font-medium marker:text-muted'
  }

  if (props.nested) {
    if (props.compact) {
      return 'mt-1.5 list-disc space-y-1.5 ps-3.5 text-[0.9rem] leading-6 marker:text-primary/70'
    }

    return 'mt-1.5 list-disc space-y-1.5 ps-5 text-base leading-7 marker:text-primary/80'
  }

  if (props.compact) {
    return 'list-disc space-y-2 ps-5 text-sm leading-6 marker:text-primary/70'
  }

  return 'list-disc space-y-2 ps-5 text-base leading-7 marker:text-primary/80'
})
</script>

<template>
  <component :is="listTag" :class="listClass">
    <li
      v-for="(link, index) in links"
      :key="link.url"
      :class="compact && ordered ? 'grid grid-cols-[1.75rem_minmax(0,1fr)] gap-2' : 'ps-1'"
    >
      <span
        v-if="compact && ordered"
        class="font-mono text-xs leading-6 tabular-nums text-muted"
      >
        {{ String(index + 1).padStart(2, '0') }}
      </span>
      <div class="min-w-0">
        <a
          :href="link.url"
          class="text-muted underline-offset-2 transition-colors hover:text-highlighted hover:underline"
        >
          {{ link.title }}
        </a>
        <ContentTocList v-if="link.items?.length" :links="link.items" nested :compact="compact" />
      </div>
    </li>
  </component>
</template>
