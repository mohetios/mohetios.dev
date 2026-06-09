<script setup lang="ts">
import { estimateReadingTimeFromHtml } from '~/utils/content-reading-time'

const route = useRoute()
const { locale, t } = useI18n()
const localePath = useLocalePath()
const slug = computed(() => (route.params.slug as string[]).join('/'))
const path = computed(() => `/${locale.value}/blog/${slug.value}`)
const post = computed(() => getBlogPost(path.value))

if (!post.value || post.value.draft) {
  throw createError({ statusCode: 404, statusMessage: 'Blog post not found', fatal: true })
}

const posts = computed(() => getBlogPosts(locale.value))
const tocLinks = computed(() => getTocNavLinks(post.value?.tocData))
const showToc = computed(() => shouldShowToc(post.value?.tocData))
const surround = computed(() => getSurround(posts.value, path.value))
const relatedPosts = computed(() => {
  const currentTags = new Set(post.value?.tags || [])

  if (!currentTags.size) {
    return []
  }

  return posts.value
    .filter((item) => item.path !== path.value && item.tags?.some((tag) => currentTags.has(tag)))
    .slice(0, 3)
})

const readingTime = computed(() => {
  if (post.value?.readingTime) {
    return post.value.readingTime
  }

  const minutes = estimateReadingTimeFromHtml(post.value?.content)
  return t('content.meta.readingTimeValue', { count: minutes })
})

const articleStatus = computed(() => post.value?.category || post.value?.status || t('badges.blog'))

useMohetSeo({
  title: () => `${post.value?.title} · ${t('badges.blog')} · Mohetios.dev`,
  description: post.value.description,
  path: () => post.value?.path,
  image: () => post.value?.thumbnail,
  type: 'article',
  publishedTime: () => post.value?.date,
  modifiedTime: () => post.value?.updated
})
</script>

<template>
  <UPage v-if="post">
    <ContentArticleJsonLd
      kind="blog"
      :title="post.title"
      :description="post.description"
      :path="post.path"
      :image="post.thumbnail"
      :date="post.date"
      :updated="post.updated"
    />

    <ContentArticleHeader
      :title="post.title"
      :description="post.description"
      :thumbnail="post.thumbnail"
      :thumbnail-alt="post.thumbnailAlt || post.title"
      :thumbnail-credit="post.thumbnailCredit"
      :date="post.date"
      :updated="post.updated"
      :author="post.author || 'Ali Zemani'"
      :reading-time="readingTime"
      :status="articleStatus"
      :tags="post.tags"
      :back-to="localePath('/blog')"
      :back-label="t('content.actions.backToBlog')"
      show-copy-link
    />

    <ContentShell
      :content="post.content"
      :toc-links="tocLinks"
      :show-toc="showToc"
      :summary="post.summary"
    />

    <div class="mohetios-article-tail">
      <ClientOnly>
        <CommentsBlock
          target-type="BLOG_POST"
          :target-path="path"
          :target-title="post.title"
        />
      </ClientOnly>

      <ContentArticleFooter :surround="surround" :related-posts="relatedPosts" />
    </div>
  </UPage>
</template>
