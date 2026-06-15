<script setup lang="ts">
import type { TocItem } from '~/utils/content'
import { PUBLIC_ARTICLE_READING_CLASS } from '~~/shared/constants/layout'

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
  <UPageBody :ui="{ base: 'mt-0 space-y-0 pb-20' }">
    <div class="w-full min-w-0">
      <section class="py-6 sm:py-8">
        <ContentCodeEnhancer />
        <LazyContentMermaidEnhancer />

        <div :class="[PUBLIC_ARTICLE_READING_CLASS, 'flex flex-col gap-8']">
          <slot name="notice" />

          <ContentArticleSummary v-if="summary?.length" :items="summary" />

          <ContentToc v-if="showToc" :title="$t('content.toc')" :links="tocLinks" />

          <article class="prose prose-lg max-w-none">
            <ContentHtml :html="content" />
          </article>

          <div v-if="$slots.share">
            <slot name="share" />
          </div>

          <div
            v-if="backTo || surround?.some(Boolean) || $slots.related || kind || $slots.comments"
            class="flex flex-col gap-8 border-t border-default pt-8 [&_.comments-section]:mt-0"
          >
            <slot name="comments" />

            <UButton
              v-if="backTo"
              :to="backTo"
              color="neutral"
              variant="ghost"
              size="sm"
              icon="i-lucide-arrow-left"
              :ui="{ label: 'text-base' }"
            >
              {{ backLabel }}
            </UButton>

            <section v-if="surround?.some(Boolean)" class="space-y-3">
              <p class="text-sm font-medium tracking-[0.14em] text-muted uppercase">
                {{ $t('content.article.continueReading') }}
              </p>
              <ContentSurround :surround="surround || []" />
            </section>

            <slot name="related" />

            <ContentSubscribe v-if="kind" :kind="kind" plain />
          </div>
        </div>
      </section>
    </div>
  </UPageBody>
</template>
