<script setup lang="ts">
const { locale, t } = useI18n()
const localePath = useLocalePath()
const posts = computed(() => getBlogPosts(locale.value, 3))
const labNotes = computed(() => getLabNotes(locale.value, 3))
const projects = computed(() => getProjects(locale.value, 3))

const featuredPost = computed(() => posts.value?.find((post) => post.thumbnail) || posts.value?.[0])
const siteWordmark = computed(() => getSeoSiteName(t))

useMohetiosSeo({
  title: () => siteWordmark.value,
  description: () => t('site.description'),
  path: () => getLocalizedPublicPath('/', locale.value),
  locale: () => locale.value,
  type: 'website'
})

const workshopItems = computed(() => [
  t('home.workshop.items.softwareSystems'),
  t('home.workshop.items.openSourceProducts'),
  t('home.workshop.items.aiTravelTools'),
  t('home.workshop.items.geometryNotes')
])

const trackCards = computed(() => [
  {
    icon: 'i-lucide-pen-line',
    title: t('home.tracks.blog.title'),
    description: t('home.tracks.blog.description'),
    to: localePath('/blog'),
    label: t('actions.readBlog')
  },
  {
    icon: 'i-lucide-flask-conical',
    title: t('home.tracks.lab.title'),
    description: t('home.tracks.lab.description'),
    to: localePath('/lab'),
    label: t('actions.exploreLab')
  },
  {
    icon: 'i-lucide-box',
    title: t('home.tracks.projects.title'),
    description: t('home.tracks.projects.description'),
    to: localePath('/projects'),
    label: t('actions.viewProjects')
  }
])

const principles = computed(() => [
  t('home.principles.items.smallUseful'),
  t('home.principles.items.preservePath'),
  t('home.principles.items.clearInterfaces'),
  t('home.principles.items.openWorkshop')
])

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
</script>

<template>
  <div>
    <section class="px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
      <div class="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div class="max-w-3xl space-y-7">

          <div class="space-y-5">
            <h1
              class="max-w-4xl text-5xl font-semibold tracking-tight text-highlighted sm:text-6xl lg:text-7xl"
            >
              {{ t('site.tagline') }}
            </h1>
            <p class="max-w-2xl text-lg leading-8 text-muted sm:text-xl">
              {{ t('home.hero.description') }}
            </p>
          </div>

          <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <UButton :to="localePath('/blog')" size="lg" trailing-icon="i-lucide-arrow-right">
              {{ t('actions.readBlog') }}
            </UButton>
            <UButton :to="localePath('/lab')" color="neutral" variant="subtle" size="lg">
              {{ t('actions.exploreLab') }}
            </UButton>
            <UButton :to="localePath('/projects')" color="neutral" variant="ghost" size="lg">
              {{ t('actions.viewProjects') }}
            </UButton>
          </div>
        </div>

        <aside class="rounded-2xl border border-default bg-muted/30 p-5 sm:p-6">
          <div class="flex items-center justify-between gap-4 border-b border-default pb-4">
            <div>
              <p class="text-xs font-medium uppercase tracking-widest text-muted">
                {{ t('home.workshop.label') }}
              </p>
            </div>
            <UIcon name="i-lucide-square-terminal" class="size-7 text-muted" />
          </div>

          <div class="grid gap-3 py-5">
            <div
              v-for="item in workshopItems"
              :key="item"
              class="flex items-center gap-3 rounded-xl border border-default bg-default px-4 py-3"
            >
              <span class="size-2 rounded-full bg-primary" />
              <span class="text-sm font-medium text-highlighted">{{ item }}</span>
            </div>
          </div>

          <p class="border-t border-default pt-4 text-sm leading-6 text-muted">
            {{ t('home.workshop.footer') }}
          </p>
        </aside>
      </div>
    </section>

    <section v-if="featuredPost" class="px-4 pb-12 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-6xl">
        <article
          class="grid overflow-hidden rounded-2xl border border-default bg-default md:grid-cols-2"
        >
          <div v-if="featuredPost.thumbnail" class="bg-muted">
            <NuxtImg
              :src="featuredPost.thumbnail"
              :alt="featuredPost.title"
              loading="eager"
              fetchpriority="high"
              class="aspect-[4/3] h-full w-full object-cover md:aspect-auto"
              sizes="xs:100vw md:50vw lg:560px"
              placeholder
            />
          </div>
          <div
            v-else
            class="flex aspect-[4/3] min-h-64 w-full flex-col items-center justify-center gap-4 bg-muted/40 p-8 text-sm font-medium uppercase tracking-widest text-muted md:aspect-auto md:h-full"
          >
            <div
              class="grid size-16 place-items-center rounded-full border border-default bg-default/70"
            >
              <UIcon name="i-lucide-image" class="size-7 text-muted" />
            </div>
            <span>{{ t('home.featured.placeholder') }}</span>
          </div>

          <div class="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
            <div class="mb-5 flex flex-wrap items-center gap-3">
              <UBadge color="neutral" variant="outline">
                {{ t('home.featured.label') }}
              </UBadge>
              <time v-if="featuredPost.date" class="text-xs text-muted">
                {{ formatDate(featuredPost.date) }}
              </time>
            </div>

            <h2 class="text-3xl font-semibold tracking-tight text-highlighted sm:text-4xl">
              <NuxtLink :to="toPublicPath(featuredPost.path)" class="hover:underline">
                {{ featuredPost.title }}
              </NuxtLink>
            </h2>
            <p class="mt-4 text-base leading-8 text-muted">
              {{ featuredPost.description }}
            </p>

            <div v-if="featuredPost.tags?.length" class="mt-5 flex flex-wrap gap-2">
              <NuxtLink
                v-for="tag in featuredPost.tags"
                :key="tag"
                :to="localePath(`/tags/${normalizeTagSlug(tag)}`)"
                class="inline-flex"
              >
                <UBadge color="neutral" variant="soft" class="hover:bg-muted">
                  {{ tag }}
                </UBadge>
              </NuxtLink>
            </div>

            <UButton
              :to="toPublicPath(featuredPost.path)"
              color="neutral"
              variant="subtle"
              trailing-icon="i-lucide-arrow-right"
              class="mt-7 w-fit"
            >
              {{ t('home.featured.action') }}
            </UButton>
          </div>
        </article>
      </div>
    </section>

    <UPageSection
      :title="t('home.tracks.title')"
      :description="t('home.tracks.description')"
      :ui="{ container: 'py-12 sm:py-16' }"
    >
      <UPageGrid>
        <UPageCard
          v-for="track in trackCards"
          :key="track.title"
          :title="track.title"
          :description="track.description"
          :to="track.to"
          variant="subtle"
        >
          <template #leading>
            <div
              class="flex size-10 items-center justify-center rounded-xl border border-default bg-default"
            >
              <UIcon :name="track.icon" class="size-5 text-muted" />
            </div>
          </template>

          <template #footer>
            <span class="inline-flex items-center gap-2 text-sm font-medium text-highlighted">
              {{ track.label }}
              <UIcon name="i-lucide-arrow-right" class="size-4" />
            </span>
          </template>
        </UPageCard>
      </UPageGrid>
    </UPageSection>

    <UPageSection
      :title="t('sections.latestWriting')"
      :description="t('sections.latestWritingDescription')"
      :ui="{ container: 'py-12 sm:py-16' }"
    >
      <UPageGrid v-if="posts?.length">
        <ContentCard
          v-for="post in posts"
          :key="post.id"
          :title="post.title"
          :description="post.description"
          :to="toPublicPath(post.path)"
          :date="post.date"
          :badge="t('badges.blog')"
          :tags="post.tags"
          :thumbnail="post.thumbnail"
        />
      </UPageGrid>
      <UiEmpty v-else :title="t('empty.blogTitle')" :description="t('empty.blogDescription')" />
    </UPageSection>

    <section class="px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div class="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
        <div class="space-y-5">
          <div>
            <h2 class="text-2xl font-semibold tracking-tight text-highlighted">
              {{ t('sections.labNotes') }}
            </h2>
            <p class="mt-2 text-sm leading-6 text-muted">
              {{ t('sections.labNotesDescription') }}
            </p>
          </div>

          <div v-if="labNotes?.length" class="grid auto-rows-fr gap-4">
            <ContentCard
              v-for="note in labNotes"
              :key="note.id"
              :title="note.title"
              :description="note.description"
              :to="toPublicPath(note.path)"
              :date="note.date"
              :badge="t('badges.lab')"
              :tags="note.tags"
              :thumbnail="note.thumbnail"
              hide-media
            />
          </div>
          <UiEmpty
            v-else
            :title="t('empty.labTitle')"
            :description="t('empty.labDescription')"
          />
        </div>

        <div class="space-y-5">
          <div>
            <h2 class="text-2xl font-semibold tracking-tight text-highlighted">
              {{ t('sections.featuredProjects') }}
            </h2>
            <p class="mt-2 text-sm leading-6 text-muted">
              {{ t('sections.featuredProjectsDescription') }}
            </p>
          </div>

          <div v-if="projects?.length" class="grid auto-rows-fr gap-4">
            <ContentCard
              v-for="project in projects"
              :key="project.id"
              :title="project.title"
              :description="project.description"
              :to="toPublicPath(project.path)"
              :date="project.date"
              :badge="project.status"
              :tags="project.tags"
              :thumbnail="project.thumbnail"
              hide-media
            />
          </div>
          <UiEmpty
            v-else
            :title="t('empty.projectsTitle')"
            :description="t('empty.projectsDescription')"
          />
        </div>
      </div>
    </section>

    <section class="px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div class="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <h2 class="text-3xl font-semibold tracking-tight text-highlighted">
            {{ t('sections.principles') }}
          </h2>
          <p class="mt-4 max-w-md text-base leading-8 text-muted">
            {{ t('sections.principlesDescription') }}
          </p>
        </div>

        <div class="grid gap-3">
          <div
            v-for="(principle, index) in principles"
            :key="principle"
            class="grid gap-4 rounded-2xl border border-default bg-muted/20 p-5 sm:grid-cols-[3rem_1fr]"
          >
            <div class="text-sm font-semibold text-muted">
              {{ String(index + 1).padStart(2, '0') }}
            </div>
            <p class="text-sm leading-7 text-muted">
              {{ principle }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="px-4 py-16 sm:px-6 lg:px-8">
      <div
        class="mx-auto max-w-6xl rounded-2xl border border-default bg-muted/30 p-6 sm:p-8 lg:p-10"
      >
        <div class="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div class="max-w-2xl">
            <h2 class="text-3xl font-semibold tracking-tight text-highlighted">
              {{ t('home.cta.title') }}
            </h2>
            <p class="mt-3 text-base leading-7 text-muted">
              {{ t('home.cta.description') }}
            </p>
          </div>

          <div class="flex flex-col gap-3 sm:flex-row">
            <UButton :to="localePath('/blog')" trailing-icon="i-lucide-arrow-right">
              {{ t('nav.blog') }}
            </UButton>
            <UButton :to="localePath('/projects')" color="neutral" variant="subtle">
              {{ t('nav.projects') }}
            </UButton>
          </div>
        </div>
      </div>
    </section>

    <section class="px-4 pb-16 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-6xl">
        <NewsletterSubscribe source="home" />
      </div>
    </section>
  </div>
</template>
