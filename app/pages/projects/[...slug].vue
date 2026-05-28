<script setup lang="ts">
const route = useRoute()
const { locale, t } = useI18n()
const localePath = useLocalePath()
const slug = computed(() => (route.params.slug as string[]).join('/'))
const path = computed(() => `/${locale.value}/projects/${slug.value}`)

const { data: project } = await useAsyncData(
  `projects:${path.value}`,
  () => queryCollection('projects').where('path', '=', path.value).first(),
  { watch: [path] }
)

if (!project.value || project.value.draft) {
  throw createError({ statusCode: 404, statusMessage: 'Project not found', fatal: true })
}

const contentPrefix = computed(() => `/${locale.value}/projects/`)
const { data: projects } = await useAsyncData(
  `projects:surround:${locale.value}:${slug.value}`,
  () =>
    queryCollection('projects')
      .where('path', 'LIKE', `${contentPrefix.value}%`)
      .order('date', 'DESC')
      .all(),
  { watch: [path] }
)

const visibleProjects = computed(() => projects.value?.filter((item) => item.draft !== true) || [])
const surround = computed(() => {
  const index = visibleProjects.value.findIndex((item) => item.path === path.value)

  if (index < 0) {
    return []
  }

  return [visibleProjects.value[index + 1] || null, visibleProjects.value[index - 1] || null]
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
const metaItems = computed(() =>
  [
    { label: t('content.meta.status'), value: project.value?.status },
    { label: t('content.meta.started'), value: project.value?.date },
    { label: t('content.meta.updated'), value: project.value?.updated },
    { label: t('content.meta.repository'), value: project.value?.repo, to: project.value?.repo },
    { label: t('content.meta.website'), value: project.value?.website, to: project.value?.website }
  ].filter((item) => item.value)
)

function formatDate(date?: string | Date) {
  if (!date) {
    return ''
  }

  return new Date(date).toLocaleDateString(locale.value, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function formatMetaValue(label: string, value: unknown) {
  if (label === t('content.meta.started') || label === t('content.meta.updated')) {
    return formatDate(value as string | Date)
  }

  return String(value)
}

useSeoMeta({
  title: () => `${project.value?.title} · ${t('nav.projects')} · Mohetios.dev`,
  description: project.value.description,
  ogTitle: project.value.title,
  ogDescription: project.value.description,
  ogImage: project.value.thumbnail,
  ogUrl: `https://mohetios.dev${project.value.path}`
})
</script>

<template>
  <UPage v-if="project">
    <UPageHeader
      :title="project.title"
      :description="project.description"
      class="mx-auto max-w-5xl"
    >
      <template #headline>
        <ContentMeta :date="project.date" :updated="project.updated" :status="project.status" />
      </template>
      <ContentTagList :tags="project.tags" />
    </UPageHeader>

    <UPageBody>
      <NuxtImg
        v-if="project.thumbnail"
        :src="project.thumbnail"
        :alt="project.title"
        class="mx-auto mb-10 aspect-[16/9] w-full max-w-6xl rounded-2xl object-cover ring ring-default"
        sizes="xs:100vw lg:1100px"
      />

      <div class="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <article class="min-w-0">
          <ContentRenderer :value="project" class="prose-mohetios max-w-none" />
        </article>

        <aside class="lg:order-last">
          <div class="sticky top-24 space-y-5">
            <UCard variant="subtle">
              <div class="space-y-5">
                <div v-for="item in metaItems" :key="item.label">
                  <p class="text-xs font-medium uppercase tracking-widest text-muted">
                    {{ item.label }}
                  </p>
                  <UButton
                    v-if="item.to"
                    :to="String(item.to)"
                    color="neutral"
                    variant="link"
                    trailing-icon="i-lucide-external-link"
                    target="_blank"
                    class="mt-1 p-0"
                  >
                    {{ item.label }}
                  </UButton>
                  <p v-else class="mt-2 text-sm font-medium text-highlighted">
                    {{ formatMetaValue(item.label, item.value) }}
                  </p>
                </div>

                <div v-if="project.tags?.length">
                  <p class="text-xs font-medium uppercase tracking-widest text-muted">
                    {{ t('content.meta.stack') }}
                  </p>
                  <ContentTagList class="mt-2" :tags="project.tags" />
                </div>
              </div>
            </UCard>

            <div class="flex flex-wrap gap-2">
              <UButton
                v-if="project.repo"
                :to="project.repo"
                color="neutral"
                variant="subtle"
                icon="i-lucide-github"
                target="_blank"
              >
                {{ t('content.meta.repository') }}
              </UButton>
              <UButton
                v-if="project.website"
                :to="project.website"
                color="neutral"
                variant="subtle"
                icon="i-lucide-external-link"
                target="_blank"
              >
                {{ t('content.meta.website') }}
              </UButton>
            </div>
          </div>
        </aside>
      </div>

      <div class="mx-auto mt-12 max-w-5xl space-y-8">
        <UButton
          :to="localePath('/projects')"
          color="neutral"
          variant="ghost"
          icon="i-lucide-arrow-left"
        >
          {{ t('content.actions.backToProjects') }}
        </UButton>

        <ContentSurround v-if="surround.length" :surround="surround" />

        <section v-if="relatedProjects.length" class="border-t border-default pt-8">
          <h2 class="mb-4 text-xl font-semibold tracking-tight text-highlighted">
            {{ t('content.related') }}
          </h2>
          <UPageGrid>
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
            />
          </UPageGrid>
        </section>
      </div>
    </UPageBody>
  </UPage>
</template>
