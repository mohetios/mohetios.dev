<script setup lang="ts">
import type { CommentTargetType } from '~~/shared/constants/comments'
import type { TocItem } from '~/utils/content'
import { estimateReadingTimeFromHtml } from '~/utils/content-reading-time'

type ContentKind = 'blog' | 'lab' | 'project'

type ContentPageItem = {
  id?: string
  path: string
  title: string
  description?: string
  summary?: string[]
  content: string
  thumbnail?: string
  thumbnailAlt?: string
  thumbnailCredit?: string
  date?: string | Date
  updated?: string | Date
  author?: string
  readingTime?: string
  tags?: string[]
  category?: string
  status?: string
  draft?: boolean
  tocData?: TocItem[]
}

const props = defineProps<{
  kind: ContentKind
  item: ContentPageItem
  collection: ContentPageItem[]
  path: string
  backTo: string
  backLabel: string
  commentsTargetType?: CommentTargetType
}>()

const { locale, t } = useI18n()

const publicPath = computed(() => toPublicPath(props.item.path || props.path))
const tocLinks = computed(() => getTocNavLinks(props.item.tocData))
const showToc = computed(() => shouldShowToc(props.item.tocData))
const surround = computed(() => getSurround(props.collection, props.item.path || props.path))

const kindLabel = computed(() => t(`content.kind.${props.kind}`))
const articleStatus = computed(() => props.item.category || props.item.status || kindLabel.value)

const readingTime = computed(() => {
  if (props.item.readingTime) {
    return props.item.readingTime
  }

  const minutes = estimateReadingTimeFromHtml(props.item.content)
  return t('content.meta.readingTimeValue', {
    count: formatLocalizedNumber(minutes, locale.value)
  })
})

const relatedItems = computed(() => {
  const currentTags = new Set(props.item.tags || [])

  if (!currentTags.size) {
    return []
  }

  const currentPath = props.item.path || props.path

  return props.collection
    .filter(
      (candidate) =>
        candidate.path !== currentPath && candidate.tags?.some((tag) => currentTags.has(tag))
    )
    .slice(0, 3)
})

const relatedLabel = computed(() => {
  if (props.kind === 'lab') return t('content.article.relatedExperiments')
  if (props.kind === 'project') return t('content.article.relatedSystems')

  return t('content.article.relatedNotes')
})

const author = computed(() => {
  if (props.item.author) {
    return props.item.author
  }

  return props.kind === 'project' ? undefined : 'Ali Zemani'
})

const { canonicalUrl: shareUrl } = useContentSeo({
  title: () => props.item.title,
  description: () => props.item.description,
  path: () => publicPath.value,
  image: () => props.item.thumbnail,
  locale: () => locale.value,
  publishedAt: () => props.item.date,
  updatedAt: () => props.item.updated,
  tags: () => props.item.tags || [],
  category: () => articleStatus.value
})
</script>

<template>
  <UPage>
    <ContentArticleJsonLd
      :kind="kind"
      :title="item.title"
      :description="item.description"
      :path="item.path"
      :image="item.thumbnail"
      :date="item.date"
      :updated="item.updated"
    />

    <ContentArticleHeader
      :title="item.title"
      :description="item.description"
      :thumbnail="item.thumbnail"
      :thumbnail-alt="item.thumbnailAlt || item.title"
      :thumbnail-credit="item.thumbnailCredit"
      :date="item.date"
      :updated="item.updated"
      :author="author"
      :reading-time="readingTime"
      :status="articleStatus"
      :tags="item.tags"
      :back-to="backTo"
      :back-label="backLabel"
    />

    <ContentShell
      :kind="kind"
      :content="item.content"
      :toc-links="tocLinks"
      :show-toc="showToc"
      :summary="item.summary"
      :surround="surround"
    >
      <template #share>
        <ContentSocialShare :title="item.title" :description="item.description" :url="shareUrl" />
      </template>

      <template v-if="commentsTargetType" #comments>
        <ContentComments
          :target-type="commentsTargetType"
          :target-path="path"
          :target-title="item.title"
        />
      </template>

      <template #related>
        <section v-if="relatedItems.length" class="space-y-3">
          <p class="mh-kicker text-muted">
            {{ relatedLabel }}
          </p>
          <div class="flex flex-col gap-1">
            <ContentList
              v-for="related in relatedItems"
              :key="related.id || related.path"
              plain
              :title="related.title"
              :description="related.description"
              :to="related.path"
              :date="related.date"
              :updated="related.updated"
            />
          </div>
        </section>
      </template>
    </ContentShell>
  </UPage>
</template>
