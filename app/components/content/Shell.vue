<script setup lang="ts">
import type { TocItem } from '~/utils/content'

type SurroundItem = {
  title: string
  path: string
  description?: string
} | null

withDefaults(
  defineProps<{
    kind?: 'blog' | 'lab' | 'project'
    content: string
    tocLinks?: TocItem[]
    showToc?: boolean
    summary?: string[]
    surround?: SurroundItem[]
    backTo?: string
    backLabel?: string
  }>(),
  {
    kind: undefined,
    tocLinks: () => [],
    showToc: false,
    summary: undefined,
    surround: undefined,
    backTo: undefined,
    backLabel: undefined
  }
)
</script>

<template>
  <UPageBody>
    <section class="mohetios-editorial-column min-w-0 py-8">
      <ContentCodeEnhancer />

      <slot name="notice" />

      <ContentArticleSummary v-if="summary?.length" :items="summary" class="mb-8" />

      <ContentToc v-if="showToc" class="mb-8" :title="$t('content.toc')" :links="tocLinks" />

      <article class="prose-mohetios">
        <ContentHtml :html="content" />
      </article>
    </section>

    <div
      v-if="backTo || surround?.some(Boolean) || $slots.related || kind"
      class="mohetios-editorial-column min-w-0 space-y-8 pb-10"
    >
      <UButton
        v-if="backTo"
        :to="backTo"
        color="neutral"
        variant="ghost"
        icon="i-lucide-arrow-left"
      >
        {{ backLabel }}
      </UButton>

      <ContentSurround v-if="surround?.some(Boolean)" :surround="surround || []" />

      <slot name="related" />

      <ContentSubscribe v-if="kind" size="large" :kind="kind" />
    </div>
  </UPageBody>
</template>
