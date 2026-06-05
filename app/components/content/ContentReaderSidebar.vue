<script setup lang="ts">
type TocItem = {
  title: string
  url: string
  items?: TocItem[]
}

defineProps<{
  kind: 'blog' | 'lab' | 'project'
  tocLinks: TocItem[]
  showToc: boolean
  date?: string | Date
  updated?: string | Date
  status?: string
  tags?: string[]
  projectRepo?: string
  projectWebsite?: string
  content?: string
}>()
</script>

<template>
  <div class="sticky top-24 space-y-5">
    <ContentMetaCard
      :kind="kind"
      :date="date"
      :updated="updated"
      :status="status"
      :tags="tags"
      :project-repo="projectRepo"
      :project-website="projectWebsite"
      :content="content"
    />

    <ContentSubscribeCard size="compact" :kind="kind" />

    <ContentShareActions />

    <ContentToc
      v-if="showToc"
      :title="$t('content.toc')"
      :links="tocLinks"
      highlight
    />
  </div>
</template>
