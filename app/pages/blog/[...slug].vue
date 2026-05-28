<script setup lang="ts">
const route = useRoute()
const { locale, t } = useI18n()
const localePath = useLocalePath()
const slug = computed(() => (route.params.slug as string[]).join('/'))
const path = computed(() => `/${locale.value}/blog/${slug.value}`)

const { data: post } = await useAsyncData(
  `blog:${path.value}`,
  () => queryCollection('blog').where('path', '=', path.value).first(),
  { watch: [path] }
)

if (!post.value || post.value.draft) {
  throw createError({ statusCode: 404, statusMessage: 'Blog post not found', fatal: true })
}

const contentPrefix = computed(() => `/${locale.value}/blog/`)
const { data: posts } = await useAsyncData(
  `blog:surround:${locale.value}:${slug.value}`,
  () =>
    queryCollection('blog')
      .where('path', 'LIKE', `${contentPrefix.value}%`)
      .order('date', 'DESC')
      .all(),
  { watch: [path] }
)

const tocLinks = computed(() => post.value?.body?.toc?.links || [])
const showToc = computed(() => tocLinks.value.length > 2)
const visiblePosts = computed(() => posts.value?.filter((item) => item.draft !== true) || [])
const surround = computed(() => {
  const index = visiblePosts.value.findIndex((item) => item.path === path.value)

  if (index < 0) {
    return []
  }

  return [visiblePosts.value[index + 1] || null, visiblePosts.value[index - 1] || null]
})
const relatedPosts = computed(() => {
  const currentTags = new Set(post.value?.tags || [])

  if (!currentTags.size) {
    return []
  }

  return visiblePosts.value
    .filter((item) => item.path !== path.value && item.tags?.some((tag) => currentTags.has(tag)))
    .slice(0, 3)
})

useSeoMeta({
  title: () => `${post.value?.title} · ${t('badges.blog')} · Mohetios.dev`,
  description: post.value.description,
  ogTitle: post.value.title,
  ogDescription: post.value.description,
  ogImage: post.value.thumbnail,
  ogUrl: `https://mohetios.dev${post.value.path}`,
  articlePublishedTime: post.value.date?.toString(),
  articleModifiedTime: post.value.updated?.toString()
})
</script>

<template>
  <UPage v-if="post">
    <UPageHeader :title="post.title" :description="post.description" class="mx-auto max-w-4xl">
      <template #headline>
        <ContentMeta :date="post.date" :updated="post.updated" :status="t('badges.blog')" />
      </template>
      <ContentTagList :tags="post.tags" />
    </UPageHeader>

    <UPageBody>
      <NuxtImg
        v-if="post.thumbnail"
        :src="post.thumbnail"
        :alt="post.title"
        class="mx-auto mb-10 aspect-[16/9] w-full max-w-5xl rounded-2xl object-cover ring ring-default"
        sizes="xs:100vw lg:960px"
      />

      <div class="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <article class="min-w-0">
          <ContentRenderer :value="post" class="prose-mohetios mx-auto max-w-3xl" />
        </article>

        <aside v-if="showToc" class="hidden lg:block">
          <div class="sticky top-24">
            <ContentToc :title="t('content.toc')" :links="tocLinks" highlight />
          </div>
        </aside>
      </div>

      <div class="mx-auto mt-12 max-w-4xl space-y-8">
        <UButton
          :to="localePath('/blog')"
          color="neutral"
          variant="ghost"
          icon="i-lucide-arrow-left"
        >
          {{ t('content.actions.backToBlog') }}
        </UButton>

        <ContentSurround v-if="surround.length" :surround="surround" />

        <section v-if="relatedPosts.length" class="border-t border-default pt-8">
          <h2 class="mb-4 text-xl font-semibold tracking-tight text-highlighted">
            {{ t('content.related') }}
          </h2>
          <div class="grid gap-4 sm:grid-cols-3">
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
      </div>
    </UPageBody>
  </UPage>
</template>
