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
  <UPageBody :ui="{ base: 'mt-0 space-y-0 pb-20' }">
    <div class="w-full min-w-0">
      <section class="py-6 sm:py-8">
        <ContentCodeEnhancer />
        <LazyContentMermaidEnhancer />

        <div class="article-reading-column flex flex-col gap-8">
          <slot name="notice" />

          <ContentArticleSummary v-if="summary?.length" :items="summary" />

          <ContentToc v-if="showToc" :title="$t('content.toc')" :links="tocLinks" class="lg:hidden" />

          <article class="prose prose-lg">
            <ContentHtml :html="content" />
          </article>

          <div v-if="$slots.share">
            <slot name="share" />
          </div>

          <div
            v-if="backTo || surround?.some(Boolean) || $slots.related || $slots.comments"
            class="mt-2 flex flex-col gap-8 border-t border-default pt-8"
          >
            <section v-if="$slots.comments" class="border-b border-default/70 pb-8">
              <slot name="comments" />
            </section>

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

            <section v-if="surround?.some(Boolean)" class="space-y-3 border-b border-default/70 pb-8">
              <p class="mh-kicker text-muted">
                {{ $t('content.article.continueReading') }}
              </p>
              <ContentSurround :surround="surround || []" />
            </section>

            <section v-if="$slots.related" class="space-y-3">
              <slot name="related" />
            </section>
          </div>
        </div>
      </section>
    </div>
  </UPageBody>
</template>
