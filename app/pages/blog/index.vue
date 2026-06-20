<script setup lang="ts">
const { locale, t } = useI18n()
const localePath = useLocalePath()
const posts = computed(() => getBlogPosts(locale.value))
const tags = computed(() =>
  [...new Set(posts.value.flatMap((post) => post.tags || []))].slice(0, 12)
)
const years = computed(() => {
  const counts = new Map<string, number>()

  for (const post of posts.value) {
    if (!post.date) continue

    const year = String(new Date(post.date).getFullYear())
    counts.set(year, (counts.get(year) || 0) + 1)
  }

  return [...counts.entries()].map(([year, count]) => ({ year, count }))
})
const filterLabels = computed(() => [
  t('pages.notebook.filters.all'),
  t('pages.notebook.filters.essays'),
  t('pages.notebook.filters.buildNotes'),
  t('pages.notebook.filters.labLogs'),
  t('pages.notebook.filters.fieldNotes'),
  t('pages.notebook.filters.patterns')
])
const nearbyLinks = computed(() => [
  {
    icon: 'i-lucide-flask-conical',
    title: t('pages.labIndex.kicker'),
    description: t('pages.labIndex.status.description'),
    to: localePath('/lab')
  },
  {
    icon: 'i-lucide-wrench',
    title: t('pages.systems.kicker'),
    description: t('pages.systems.status.description'),
    to: localePath('/projects')
  }
])
useMohetiosSeo({
  title: () => t('pages.notebook.kicker'),
  description: () => t('pages.notebook.description'),
  path: () => getLocalizedPublicPath('/blog', locale.value),
  locale: () => locale.value,
  type: 'website'
})

function formatDate(date?: string | Date) {
  if (!date) return ''

  return new Date(date).toLocaleDateString(locale.value, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<template>
  <UPage class="mh-page">
    <UPageBody :ui="{ base: 'space-y-10 pb-16 sm:space-y-12' }">
      <section
        id="notebook"
        class="grid gap-8 border-b border-default pb-8 lg:grid-cols-[0.6fr_0.4fr] lg:items-end"
      >
        <div class="max-w-4xl space-y-5">
          <p class="mh-kicker">
            {{ t('pages.notebook.kicker') }}
          </p>
          <h1
            class="mh-display max-w-4xl text-4xl leading-tight font-semibold text-balance text-highlighted sm:text-5xl lg:text-6xl"
          >
            {{ t('pages.notebook.title') }}
          </h1>
          <p class="max-w-2xl text-base leading-7 text-pretty text-muted sm:text-lg sm:leading-8">
            {{ t('pages.notebook.description') }}
          </p>
        </div>

        <div class="hidden space-y-4 lg:block">
          <figure class="flex h-80 w-full items-center justify-center overflow-hidden">
            <NuxtImg
              src="/page-images/blog.webp"
              :alt="t('pages.notebook.imageAlt')"
              class="h-full w-full object-contain opacity-90 dark:hidden"
              sizes="lg:320px"
              loading="eager"
            />
            <NuxtImg
              src="/page-images/blog-dark.webp"
              alt=""
              aria-hidden="true"
              class="hidden h-full w-full object-contain opacity-85 dark:block"
              sizes="lg:320px"
              loading="eager"
            />
          </figure>

          <div v-if="tags.length" class="border-y border-default py-4">
            <p class="mh-kicker">
              {{ t('pages.notebook.indexTitle') }}
            </p>
            <div class="mt-3 flex flex-wrap gap-2">
              <NuxtLink
                v-for="tag in tags.slice(0, 8)"
                :key="tag"
                :to="localePath(`/tags/${normalizeTagSlug(tag)}`)"
                class="text-sm text-muted hover:text-primary"
              >
                #{{ tag }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </section>

      <div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <main class="min-w-0 space-y-6">
          <header class="mb-5 space-y-3">
            <div class="flex items-center gap-3 text-primary">
              <UIcon name="i-lucide-book-open" class="size-5" />
              <span class="text-sm font-semibold tabular-nums">01</span>
            </div>
            <h2
              class="mh-display text-2xl leading-tight font-semibold text-highlighted sm:text-3xl"
            >
              {{ t('pages.notebook.entriesTitle') }}
            </h2>
            <p class="max-w-2xl text-sm leading-6 text-muted">
              {{ t('pages.notebook.entriesDescription') }}
            </p>
          </header>

          <div class="flex flex-wrap gap-x-4 gap-y-2 border-y border-default py-3">
            <span
              v-for="(label, index) in filterLabels"
              :key="label"
              class="text-xs sm:text-sm"
              :class="index === 0 ? 'font-medium text-primary' : 'text-muted'"
            >
              {{ label }}
            </span>
          </div>

          <section
            v-if="posts.length"
            id="latest-notes"
            class="divide-y divide-default border-y border-default"
          >
            <NuxtLink
              v-for="post in posts"
              :key="post.id"
              :to="toPublicPath(post.path)"
              class="group block py-4 transition"
            >
              <div class="grid gap-3 sm:grid-cols-[8rem_1fr_auto] sm:items-start">
                <div class="space-y-1 text-xs leading-5 text-muted">
                  <span class="block font-medium text-primary">{{ t('badges.blog') }}</span>
                  <time v-if="post.date" class="block">{{ formatDate(post.date) }}</time>
                </div>

                <div class="min-w-0 space-y-1">
                  <h2
                    class="text-base leading-6 font-semibold text-highlighted group-hover:text-primary sm:text-lg"
                  >
                    {{ post.title }}
                  </h2>
                  <p class="line-clamp-2 text-sm leading-6 text-muted">
                    {{ post.description }}
                  </p>
                  <div v-if="post.tags?.length" class="flex flex-wrap gap-2 pt-1">
                    <span
                      v-for="tag in post.tags.slice(0, 3)"
                      :key="tag"
                      class="text-xs text-muted"
                    >
                      #{{ tag }}
                    </span>
                  </div>
                </div>

                <UIcon
                  name="i-lucide-arrow-right"
                  class="mt-1 size-4 text-muted transition group-hover:translate-x-1 group-hover:text-primary rtl:rotate-180 rtl:group-hover:-translate-x-1"
                />
              </div>
            </NuxtLink>
          </section>

          <UiEmpty v-else :title="t('empty.blogTitle')" :description="t('empty.blogDescription')" />

          <section
            id="archive"
            class="grid gap-6 border-y border-default py-7 lg:grid-cols-[0.28fr_0.72fr]"
          >
            <div class="space-y-2">
              <div class="flex items-center gap-3 text-primary">
                <UIcon name="i-lucide-archive" class="size-5" />
                <span class="text-sm font-semibold tabular-nums">02</span>
              </div>
              <h2 class="mh-display text-2xl font-semibold text-highlighted">
                {{ t('pages.notebook.archive.title') }}
              </h2>
              <p class="text-sm leading-6 text-muted">
                {{ t('pages.notebook.archive.description') }}
              </p>
            </div>
            <p class="text-sm leading-6 text-muted">
              {{ t('pages.notebook.archive.note') }}
            </p>
          </section>
        </main>

        <aside
          class="mh-index-sidebar space-y-6 border-t border-default pt-5 lg:sticky lg:top-24 lg:self-start lg:border-s lg:border-t-0 lg:ps-6 lg:pt-0"
        >
          <section v-if="years.length" class="divide-y divide-default border-y border-default">
            <div class="py-4">
              <h2 class="mh-kicker">
                {{ t('pages.notebook.yearsTitle') }}
              </h2>
            </div>
            <div
              v-for="year in years"
              :key="year.year"
              class="flex items-center justify-between gap-4 py-3"
            >
              <span class="font-mono text-sm text-highlighted">{{ year.year }}</span>
              <span class="text-xs tabular-nums text-muted">
                {{ t('pages.tagsIndex.count', { count: year.count }) }}
              </span>
            </div>
          </section>

          <section v-if="tags.length" id="tags" class="border-y border-default py-5">
            <h2 class="mh-kicker">
              {{ t('pages.notebook.indexTitle') }}
            </h2>
            <div class="mt-4 flex flex-wrap gap-2">
              <NuxtLink
                v-for="tag in tags"
                :key="tag"
                :to="localePath(`/tags/${normalizeTagSlug(tag)}`)"
                class="text-sm text-muted hover:text-primary"
              >
                #{{ tag }}
              </NuxtLink>
            </div>
            <UButton
              :to="localePath('/tags')"
              color="neutral"
              variant="link"
              trailing-icon="i-lucide-arrow-right"
              class="mt-4 px-0 rtl:[&_.iconify:last-child]:rotate-180"
            >
              {{ t('tags.allTags') }}
            </UButton>
          </section>

          <section id="nearby" class="divide-y divide-default border-y border-default">
            <div class="py-4">
              <h2 class="mh-kicker">
                {{ t('pages.notebook.nearbyTitle') }}
              </h2>
            </div>
            <NuxtLink
              v-for="link in nearbyLinks"
              :key="link.title"
              :to="link.to"
              class="group flex gap-3 py-3.5"
            >
              <UIcon :name="link.icon" class="mt-1 size-4 text-muted group-hover:text-primary" />
              <span>
                <span class="block text-sm font-semibold text-highlighted group-hover:text-primary">
                  {{ link.title }}
                </span>
                <span class="mt-1 block line-clamp-2 text-sm leading-6 text-muted">
                  {{ link.description }}
                </span>
              </span>
            </NuxtLink>
          </section>
        </aside>
      </div>
    </UPageBody>
  </UPage>
</template>
