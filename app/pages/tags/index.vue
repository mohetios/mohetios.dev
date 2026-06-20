<script setup lang="ts">
const { locale, t } = useI18n()
const localePath = useLocalePath()
const items = computed(() => getTaggedContent(locale.value))
const tags = computed(() => {
  const tagCounts = new Map<string, { label: string; count: number; sources: Set<string> }>()

  for (const item of items.value) {
    for (const tag of item.tags) {
      const slug = normalizeTagSlug(tag)

      if (!slug) continue

      const current = tagCounts.get(slug) || {
        label: tag,
        count: 0,
        sources: new Set<string>()
      }

      current.count += 1
      current.sources.add(typeLabel(item.type))
      tagCounts.set(slug, current)
    }
  }

  return [...tagCounts.entries()]
    .map(([slug, value]) => ({
      slug,
      label: value.label,
      count: value.count,
      sources: [...value.sources].join(locale.value === 'fa' ? '، ' : ', ')
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
})

function typeLabel(type: 'blog' | 'lab' | 'project') {
  return type === 'blog' ? t('tags.writing') : type === 'lab' ? t('tags.lab') : t('tags.projects')
}

useMohetiosSeo({
  title: () => t('pages.tagsIndex.kicker'),
  description: () => t('pages.tagsIndex.description'),
  path: () => getLocalizedPublicPath('/tags', locale.value),
  locale: () => locale.value,
  type: 'website'
})
</script>

<template>
  <UPage class="mh-page">
    <UPageBody :ui="{ base: 'space-y-10 pb-16 sm:space-y-12' }">
      <section
        class="grid gap-8 border-b border-default pb-8 lg:grid-cols-[0.68fr_0.32fr] lg:items-end"
      >
        <div class="max-w-4xl space-y-5">
          <p class="mh-kicker">
            {{ t('pages.tagsIndex.kicker') }}
          </p>
          <h1
            class="mh-display max-w-4xl text-4xl leading-tight font-semibold text-balance text-highlighted sm:text-5xl lg:text-6xl"
          >
            {{ t('pages.tagsIndex.title') }}
          </h1>
          <p class="max-w-2xl text-base leading-7 text-pretty text-muted sm:text-lg sm:leading-8">
            {{ t('pages.tagsIndex.description') }}
          </p>
        </div>

        <div class="hidden border-y border-default py-4 lg:block">
          <p class="mh-kicker">
            {{ t('tags.allTags') }}
          </p>
          <p class="mt-2 text-sm leading-6 text-muted">
            {{ t('pages.tagsIndex.count', { count: tags.length }) }}
          </p>
        </div>
      </section>

      <section id="topic-entries" class="grid gap-8 lg:grid-cols-[0.28fr_0.72fr]">
        <header class="space-y-3">
          <div class="flex items-center gap-3 text-primary">
            <UIcon name="i-lucide-list-ordered" class="size-5" />
            <span class="text-sm font-semibold tabular-nums">01</span>
          </div>
          <h2 class="mh-display text-2xl leading-tight font-semibold text-highlighted sm:text-3xl">
            {{ t('pages.tagsIndex.entriesTitle') }}
          </h2>
          <p class="text-sm leading-6 text-muted">
            {{ t('pages.tagsIndex.entriesDescription') }}
          </p>
        </header>

        <div>
          <div v-if="tags.length" class="divide-y divide-default border-y border-default">
            <NuxtLink
              v-for="tag in tags"
              :key="tag.slug"
              :to="localePath(`/tags/${tag.slug}`)"
              class="group block py-4"
            >
              <div class="grid gap-3 sm:grid-cols-[1fr_8rem_1fr_auto] sm:items-center">
                <div class="flex items-center gap-3">
                  <UIcon name="i-lucide-tag" class="size-4 text-muted" />
                  <h2 class="text-base font-semibold text-highlighted group-hover:text-primary">
                    {{ tag.label }}
                  </h2>
                </div>
                <p class="text-xs tabular-nums text-primary">
                  {{ t('pages.tagsIndex.count', { count: tag.count }) }}
                </p>
                <p class="text-sm text-muted">{{ tag.sources }}</p>
                <UIcon
                  name="i-lucide-arrow-right"
                  class="size-4 text-muted transition group-hover:translate-x-1 group-hover:text-primary rtl:rotate-180 rtl:group-hover:-translate-x-1"
                />
              </div>
            </NuxtLink>
          </div>

          <UiEmpty v-else :title="t('tags.emptyTitle')" :description="t('tags.emptyDescription')" />
        </div>
      </section>

      <section
        id="return-paths"
        class="grid gap-6 border-y border-default py-7 lg:grid-cols-[0.28fr_0.72fr]"
      >
        <div class="space-y-2">
          <div class="flex items-center gap-3 text-primary">
            <UIcon name="i-lucide-archive" class="size-5" />
            <span class="text-sm font-semibold tabular-nums">02</span>
          </div>
          <h2 class="mh-display text-2xl font-semibold text-highlighted">
            {{ t('pages.tagsIndex.returnTitle') }}
          </h2>
        </div>

        <div
          class="grid divide-y divide-default sm:grid-cols-2 sm:divide-x sm:divide-y-0 sm:rtl:divide-x-reverse"
        >
          <NuxtLink
            :to="localePath('/blog')"
            class="group flex items-center justify-between gap-4 py-4 sm:px-5 sm:py-0"
          >
            <span class="text-sm font-semibold text-highlighted group-hover:text-primary">
              {{ t('tags.backToWriting') }}
            </span>
            <UIcon
              name="i-lucide-arrow-right"
              class="size-4 text-muted transition group-hover:translate-x-1 group-hover:text-primary rtl:rotate-180 rtl:group-hover:-translate-x-1"
            />
          </NuxtLink>
          <NuxtLink
            :to="localePath('/projects')"
            class="group flex items-center justify-between gap-4 py-4 sm:px-5 sm:py-0"
          >
            <span class="text-sm font-semibold text-highlighted group-hover:text-primary">
              {{ t('pages.systems.kicker') }}
            </span>
            <UIcon
              name="i-lucide-arrow-right"
              class="size-4 text-muted transition group-hover:translate-x-1 group-hover:text-primary rtl:rotate-180 rtl:group-hover:-translate-x-1"
            />
          </NuxtLink>
        </div>
      </section>
    </UPageBody>
  </UPage>
</template>
