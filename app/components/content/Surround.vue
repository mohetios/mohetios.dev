<script setup lang="ts">
type SurroundItem = {
  title: string
  description?: string
  path: string
} | null

defineProps<{
  surround: SurroundItem[]
}>()

const { t } = useI18n()
</script>

<template>
  <div class="grid gap-6 sm:grid-cols-2">
    <NuxtLink
      v-if="surround[0]"
      :to="toPublicPath(surround[0].path)"
      class="group flex min-w-0 flex-col gap-1 py-2 no-underline transition-colors duration-150"
    >
      <span
        class="inline-flex items-center gap-1.5 text-ui-xs font-medium tracking-[0.12em] text-muted uppercase"
      >
        <UIcon name="i-lucide-arrow-left" class="size-3.5" />
        {{ t('content.article.previous') }}
      </span>
      <span
        class="text-reader-sm font-medium leading-(--text-reader-sm--line-height) text-highlighted transition-colors duration-150 group-hover:text-primary"
      >
        {{ surround[0].title }}
      </span>
    </NuxtLink>
    <div v-else class="hidden sm:block" aria-hidden="true" />

    <NuxtLink
      v-if="surround[1]"
      :to="toPublicPath(surround[1].path)"
      class="group flex min-w-0 flex-col gap-1 py-2 no-underline transition-colors duration-150 sm:items-end sm:text-end"
    >
      <span
        class="inline-flex items-center gap-1.5 text-ui-xs font-medium tracking-[0.12em] text-muted uppercase sm:justify-end"
      >
        {{ t('content.article.next') }}
        <UIcon name="i-lucide-arrow-right" class="size-3.5" />
      </span>
      <span
        class="text-reader-sm font-medium leading-(--text-reader-sm--line-height) text-highlighted transition-colors duration-150 group-hover:text-primary"
      >
        {{ surround[1].title }}
      </span>
    </NuxtLink>
  </div>
</template>
