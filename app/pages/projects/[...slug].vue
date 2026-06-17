<script setup lang="ts">
import { estimateReadingTimeFromHtml } from '~/utils/content-reading-time'

const route = useRoute()
const { locale, t } = useI18n()
const localePath = useLocalePath()
const slug = computed(() => (route.params.slug as string[]).join('/'))
const path = computed(() => `/${locale.value}/projects/${slug.value}`)
const project = computed(() => getProject(path.value))

if (!project.value || project.value.draft) {
  throw createError({ statusCode: 404, statusMessage: 'Project not found', fatal: true })
}

const visibleProjects = computed(() => getProjects(locale.value))
const surround = computed(() => getSurround(visibleProjects.value, path.value))
const tocLinks = computed(() => getTocNavLinks(project.value?.tocData))
const showToc = computed(() => shouldShowToc(project.value?.tocData))

const readingTime = computed(() => {
  if (project.value?.readingTime) {
    return project.value.readingTime
  }

  const minutes = estimateReadingTimeFromHtml(project.value?.content)
  return t('content.meta.readingTimeValue', { count: minutes })
})
const relatedProjects = computed(() => {
  const currentTags = new Set(project.value?.tags || [])

  if (!currentTags.size) {
    return []
  }

  return visibleProjects.value
    .filter((item) => item.path !== path.value && item.tags?.some((tag) => currentTags.has(tag)))
    .slice(0, 2)
})

const { canonicalUrl: shareUrl } = useContentSeo({
  title: () => project.value?.title,
  description: () => project.value?.description,
  path: () => toPublicPath(project.value?.path || path.value),
  image: () => project.value?.thumbnail,
  locale: () => locale.value,
  publishedAt: () => project.value?.date,
  updatedAt: () => project.value?.updated,
  tags: () => project.value?.tags || [],
  category: () => project.value?.status || t('nav.projects')
})
</script>

<template>
  <UPage v-if="project">
    <ContentArticleJsonLd
      kind="project"
      :title="project.title"
      :description="project.description"
      :path="project.path"
      :image="project.thumbnail"
      :date="project.date"
      :updated="project.updated"
    />

    <ContentArticleHeader
      :title="project.title"
      :description="project.description"
      :thumbnail="project.thumbnail"
      :thumbnail-alt="project.thumbnailAlt || project.title"
      :thumbnail-credit="project.thumbnailCredit"
      :date="project.date"
      :updated="project.updated"
      :author="project.author"
      :reading-time="readingTime"
      :status="project.status"
      :tags="project.tags"
      :back-to="localePath('/projects')"
      :back-label="t('content.actions.backToProjects')"
    />

    <ContentShell
      kind="project"
      :content="project.content"
      :toc-links="tocLinks"
      :show-toc="showToc"
      :surround="surround"
    >
      <template #share>
        <ContentSocialShare
          :title="project.title"
          :description="project.description"
          :url="shareUrl"
        />
      </template>

      <template #comments>
        <ContentComments
          target-type="PROJECT"
          :target-path="path"
          :target-title="project.title"
        />
      </template>

      <template #related>
        <section v-if="relatedProjects.length" class="space-y-3">
          <p
            class="text-sm font-medium tracking-[0.14em] text-muted uppercase rtl:normal-case rtl:tracking-normal"
          >
            {{ t('content.related') }}
          </p>
          <div class="flex flex-col gap-1">
            <ContentList
              v-for="related in relatedProjects"
              :key="related.id"
              plain
              :title="related.title"
              :description="related.description"
              :to="related.path"
            />
          </div>
        </section>
      </template>
    </ContentShell>
  </UPage>
</template>
