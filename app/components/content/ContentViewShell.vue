<script setup lang="ts">
type TocItem = {
  title: string
  url: string
  items?: TocItem[]
}

type SurroundItem = {
  title: string
  path: string
  description?: string
} | null

const props = withDefaults(
  defineProps<{
    variant?: 'editorial' | 'classic'
    kind?: 'blog' | 'lab' | 'project'
    content: string
    tocLinks?: TocItem[]
    showToc?: boolean
    summary?: string[]
    surround?: SurroundItem[]
    backTo?: string
    backLabel?: string
    date?: string | Date
    updated?: string | Date
    status?: string
    tags?: string[]
    projectRepo?: string
    projectWebsite?: string
  }>(),
  {
    variant: 'classic',
    tocLinks: () => [],
    showToc: false
  }
)

const isEditorial = computed(() => props.variant === 'editorial')
</script>

<template>
  <UPageBody v-if="!isEditorial">
    <div class="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_16rem]">
      <article class="min-w-0">
        <ContentMobileToc
          v-if="showToc"
          class="mb-6 lg:hidden"
          :title="$t('content.mobileToc.title')"
          :links="tocLinks"
        />

        <slot name="notice" />

        <div class="relative">
          <ContentHtml
            :html="content"
            class="prose-mohetios mx-auto max-w-[var(--mohetios-reading-width)]"
          />
          <ContentCodeEnhancer />
        </div>

        <div class="mx-auto mt-10 max-w-[var(--mohetios-reading-width)]">
          <ContentSubscribeCard v-if="kind" size="large" :kind="kind" />
        </div>
      </article>

      <aside class="hidden lg:block">
        <ContentReaderSidebar
          v-if="kind"
          :kind="kind"
          :toc-links="tocLinks"
          :show-toc="showToc"
          :date="date"
          :updated="updated"
          :status="status"
          :tags="tags"
          :project-repo="projectRepo"
          :project-website="projectWebsite"
          :content="content"
        />
      </aside>
    </div>

    <div class="mx-auto mt-12 max-w-6xl space-y-8">
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
    </div>
  </UPageBody>

  <UPageBody v-else>
    <section class="mohetios-editorial-column py-8">
      <ContentCodeEnhancer />

      <slot name="notice" />

      <ContentArticleSummary
        v-if="summary?.length"
        :items="summary"
        class="mb-8"
      />

      <ContentMobileToc
        v-if="showToc"
        class="mb-8"
        compact
        :title="$t('content.toc')"
        :links="tocLinks"
      />

      <article class="prose-mohetios">
        <ContentHtml :html="content" />
      </article>
    </section>
  </UPageBody>
</template>
