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
      <LazyContentMermaidEnhancer />

      <slot name="notice" />

      <ContentArticleSummary v-if="summary?.length" :items="summary" class="mb-8" />

      <ContentToc v-if="showToc" class="mb-8" :title="$t('content.toc')" :links="tocLinks" />

      <article class="prose-mohetios">
        <ContentHtml :html="content" />
      </article>

      <div v-if="$slots.share" class="mt-10">
        <slot name="share" />
      </div>
    </section>

    <div
      v-if="backTo || surround?.some(Boolean) || $slots.related || kind || $slots.comments"
      class="mohetios-article-tail"
    >
      <slot name="comments" />

      <div class="mohetios-site-column min-w-0 space-y-10">
        <UButton
          v-if="backTo"
          :to="backTo"
          color="neutral"
          variant="ghost"
          icon="i-lucide-arrow-left"
        >
          {{ backLabel }}
        </UButton>

        <section v-if="surround?.some(Boolean)" class="space-y-4">
          <p class="mohetios-article-section-label">
            {{ $t('content.article.continueReading') }}
          </p>
          <ContentSurround :surround="surround || []" />
        </section>

        <slot name="related" />

        <section v-if="kind">
          <ContentSubscribe :kind="kind" plain />
        </section>
      </div>
    </div>
  </UPageBody>
</template>
