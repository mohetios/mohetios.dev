<script setup lang="ts">
const { locale, t } = useI18n()
const contentPrefix = computed(() => `/${locale.value}/blog/`)

const { data: posts } = await useAsyncData(
  `blog:index:${locale.value}`,
  () =>
    queryCollection('blog')
      .where('path', 'LIKE', `${contentPrefix.value}%`)
      .order('date', 'DESC')
      .all(),
  { watch: [locale] }
)

const visiblePosts = computed(() => posts.value?.filter((post) => post.draft !== true) || [])
const featuredPost = computed(() => visiblePosts.value[0])
const remainingPosts = computed(() => visiblePosts.value.slice(1))
const tags = computed(() =>
  [...new Set(visiblePosts.value.flatMap((post) => post.tags || []))].slice(0, 12)
)

useSeoMeta({
  title: () => t('content.blog.seoTitle'),
  description: () => t('pages.blogDescription')
})
</script>

<template>
  <UPage>
    <UPageHeader :title="t('content.blog.title')" :description="t('content.blog.description')">
      <template #headline>
        <UBadge color="neutral" variant="outline">
          {{ t('content.blog.eyebrow') }}
        </UBadge>
      </template>
    </UPageHeader>

    <UPageBody>
      <div v-if="visiblePosts.length" class="space-y-10">
        <ContentLeadCard
          v-if="featuredPost"
          :title="featuredPost.title"
          :description="featuredPost.description"
          :to="featuredPost.path"
          :date="featuredPost.date"
          :updated="featuredPost.updated"
          :badge="t('content.blog.latest')"
          :tags="featuredPost.tags"
          :thumbnail="featuredPost.thumbnail"
          :action-label="t('content.actions.readArticle')"
          :placeholder="t('content.blog.placeholder')"
        />

        <div v-if="tags.length" class="flex flex-wrap gap-2 border-y border-default py-4">
          <UBadge v-for="tag in tags" :key="tag" color="neutral" variant="soft">
            {{ tag }}
          </UBadge>
        </div>

        <UPageGrid v-if="remainingPosts.length">
          <ContentListCard
            v-for="post in remainingPosts"
            :key="post.id"
            :title="post.title"
            :description="post.description"
            :to="post.path"
            :date="post.date"
            :updated="post.updated"
            :badge="t('badges.blog')"
            :tags="post.tags"
            :thumbnail="post.thumbnail"
          />
        </UPageGrid>
      </div>

      <EmptyState v-else :title="t('empty.blogTitle')" :description="t('empty.blogDescription')" />
    </UPageBody>
  </UPage>
</template>
