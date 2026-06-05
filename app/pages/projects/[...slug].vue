<script setup lang="ts">
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
const tocLinks = computed(() => project.value?.tocData || [])
const showToc = computed(() => tocLinks.value.length > 2)
const relatedProjects = computed(() => {
  const currentTags = new Set(project.value?.tags || [])

  if (!currentTags.size) {
    return []
  }

  return visibleProjects.value
    .filter((item) => item.path !== path.value && item.tags?.some((tag) => currentTags.has(tag)))
    .slice(0, 2)
})

useMohetSeo({
  title: () => `${project.value?.title} · ${t('nav.projects')} · Mohetios.dev`,
  description: project.value.description,
  path: () => project.value?.path,
  image: () => project.value?.thumbnail,
  type: 'article',
  publishedTime: () => project.value?.date,
  modifiedTime: () => project.value?.updated
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

    <ContentHero
      :title="project.title"
      :description="project.description"
      :thumbnail="project.thumbnail"
    />

    <ContentViewShell
      kind="project"
      :content="project.content"
      :toc-links="tocLinks"
      :show-toc="showToc"
      :surround="surround"
      :back-to="localePath('/projects')"
      :back-label="t('content.actions.backToProjects')"
      :date="project.date"
      :updated="project.updated"
      :status="project.status"
      :tags="project.tags"
      :project-repo="project.repo"
      :project-website="project.website"
    >
      <template #related>
        <section v-if="relatedProjects.length" class="border-t border-default pt-8">
          <h2 class="mb-4 text-xl font-semibold tracking-tight text-highlighted">
            {{ t('content.related') }}
          </h2>
          <div class="grid gap-4 sm:grid-cols-2">
            <ProjectCard
              v-for="related in relatedProjects"
              :key="related.id"
              :title="related.title"
              :description="related.description"
              :to="related.path"
              :date="related.date"
              :updated="related.updated"
              :status="related.status"
              :tags="related.tags"
              :thumbnail="related.thumbnail"
              :repo="related.repo"
              :website="related.website"
              :action-label="t('content.actions.openProject')"
              hide-media
            />
          </div>
        </section>
      </template>
    </ContentViewShell>
  </UPage>
</template>
