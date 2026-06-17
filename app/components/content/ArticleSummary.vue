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
    <p
      class="text-sm font-medium tracking-[0.14em] text-muted uppercase rtl:normal-case rtl:tracking-normal"
    >
      {{ heading }}
    </p>
    <ul class="space-y-2 text-base leading-7 text-muted">
      <li v-for="(item, index) in items" :key="index">
        {{ item }}
      </li>
    </ul>
  </aside>
</template>
