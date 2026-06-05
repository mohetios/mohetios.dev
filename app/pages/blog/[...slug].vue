<script setup lang="ts">
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
const tocLinks = computed(() => post.value?.tocData || [])
const showToc = computed(() => tocLinks.value.length > 2)
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

    <ContentHero
      :title="post.title"
      :description="post.description"
      :thumbnail="post.thumbnail"
    />

    <ContentViewShell
      kind="blog"
      :content="post.content"
      :toc-links="tocLinks"
      :show-toc="showToc"
      :surround="surround"
      :back-to="localePath('/blog')"
      :back-label="t('content.actions.backToBlog')"
      :date="post.date"
      :updated="post.updated"
      :status="t('badges.blog')"
      :tags="post.tags"
    >
      <template #related>
        <section v-if="relatedPosts.length" class="border-t border-default pt-8">
          <h2 class="mb-4 text-xl font-semibold tracking-tight text-highlighted">
            {{ t('content.related') }}
          </h2>
          <div class="grid gap-4 sm:grid-cols-2">
            <ContentListCard
              v-for="related in relatedPosts"
              :key="related.id"
              :title="related.title"
              :description="related.description"
              :to="related.path"
              :date="related.date"
              :updated="related.updated"
              :badge="t('badges.blog')"
              :tags="related.tags"
              compact
            />
          </div>
        </section>
      </template>
    </ContentViewShell>
  </UPage>
</template>
