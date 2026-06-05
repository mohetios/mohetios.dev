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

defineProps<{
  kind: 'blog' | 'lab' | 'project'
  content: string
  tocLinks: TocItem[]
  showToc: boolean
  surround: SurroundItem[]
  backTo: string
  backLabel: string
  date?: string | Date
  updated?: string | Date
  status?: string
  tags?: string[]
  projectRepo?: string
  projectWebsite?: string
}>()
</script>

<template>
  <UPageBody>
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
          <ContentSubscribeCard size="large" :kind="kind" />
        </div>
      </article>

      <aside class="hidden lg:block">
        <ContentReaderSidebar
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
      <UButton :to="backTo" color="neutral" variant="ghost" icon="i-lucide-arrow-left">
        {{ backLabel }}
      </UButton>

      <ContentSurround v-if="surround.length" :surround="surround" />

      <slot name="related" />
    </div>
  </UPageBody>
</template>
