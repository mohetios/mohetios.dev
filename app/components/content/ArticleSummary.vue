<script setup lang="ts">
const props = defineProps<{
  items?: string[]
}>()

const { t } = useI18n()

const heading = computed(() => t('content.article.coreIdea'))
const hasItems = computed(() => Boolean(props.items?.length))
</script>

<template>
  <aside
    v-if="hasItems"
    class="rounded-xl border border-default bg-muted/25 px-5 py-4 sm:px-6 sm:py-5"
    :aria-label="heading"
  >
    <p class="text-ui-xs font-medium uppercase tracking-widest text-muted">
      {{ heading }}
    </p>
    <ul class="mt-3 space-y-2 text-ui-sm leading-7 text-muted sm:text-reader-sm">
      <li v-for="(item, index) in items" :key="index" class="flex gap-2.5">
        <span class="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
        <span>{{ item }}</span>
      </li>
    </ul>
  </aside>
</template>
