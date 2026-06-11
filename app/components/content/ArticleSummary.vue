<script setup lang="ts">
const props = defineProps<{
  items?: string[]
}>()

const { t } = useI18n()

const heading = computed(() => t('content.article.coreIdea'))
const hasItems = computed(() => Boolean(props.items?.length))
</script>

<template>
  <aside v-if="hasItems" class="space-y-3" :aria-label="heading">
    <p class="mohetios-article-section-label">
      {{ heading }}
    </p>
    <ul class="space-y-2 text-reader-sm text-muted">
      <li v-for="(item, index) in items" :key="index">
        {{ item }}
      </li>
    </ul>
  </aside>
</template>
