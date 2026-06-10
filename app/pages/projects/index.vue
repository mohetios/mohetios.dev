<script setup lang="ts">
const { locale, t } = useI18n()
const visibleProjects = computed(() => getProjects(locale.value))
const featuredProjects = computed(() => {
  const featured = visibleProjects.value.filter((project) => project.featured)

  return featured.length ? featured : visibleProjects.value.slice(0, 2)
})
const otherProjects = computed(() =>
  visibleProjects.value.filter(
    (project) => !featuredProjects.value.some((featured) => featured.path === project.path)
  )
)

useMohetiosSeo({
  title: () => t('content.projects.title'),
  description: () => t('pages.projectsDescription'),
  path: () => getLocalizedPublicPath('/projects', locale.value),
  locale: () => locale.value,
  type: 'website'
})
</script>

<template>
  <UPage>
    <UPageHeader
      :title="t('content.projects.title')"
      :description="t('content.projects.description')"
    >
      <template #headline>
        <UBadge color="neutral" variant="outline">
          {{ t('content.projects.eyebrow') }}
        </UBadge>
      </template>
    </UPageHeader>

    <UPageBody>
      <div v-if="visibleProjects.length" class="space-y-10">
        <section>
          <div class="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 class="text-2xl font-semibold tracking-tight text-highlighted">
                {{ t('content.projects.featured') }}
              </h2>
              <p class="mt-2 text-sm text-muted">
                {{ t('content.projects.featuredDescription') }}
              </p>
            </div>
          </div>
          <UPageGrid>
            <ProjectsCard
              v-for="project in featuredProjects"
              :key="project.id"
              :title="project.title"
              :description="project.description"
              :to="project.path"
              :date="project.date"
              :updated="project.updated"
              :status="project.status"
              :tags="project.tags"
              :thumbnail="project.thumbnail"
              :repo="project.repo"
              :website="project.website"
              :action-label="t('content.actions.openProject')"
              hide-media
            />
          </UPageGrid>
        </section>

        <section v-if="otherProjects.length">
          <h2 class="mb-5 text-2xl font-semibold tracking-tight text-highlighted">
            {{ t('content.projects.archive') }}
          </h2>
          <UPageGrid>
            <ProjectsCard
              v-for="project in otherProjects"
              :key="project.id"
              :title="project.title"
              :description="project.description"
              :to="project.path"
              :date="project.date"
              :updated="project.updated"
              :status="project.status"
              :tags="project.tags"
              :thumbnail="project.thumbnail"
              :repo="project.repo"
              :website="project.website"
              :action-label="t('content.actions.openProject')"
              hide-media
            />
          </UPageGrid>
        </section>
      </div>

      <UiEmpty
        v-else
        :title="t('empty.projectsTitle')"
        :description="t('empty.projectsDescription')"
      />
    </UPageBody>
  </UPage>
</template>
