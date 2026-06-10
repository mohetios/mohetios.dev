<script setup lang="ts">
import type { TaggedContentItem, TaggedContentType } from '~/utils/content'

const route = useRoute()
const { locale, t } = useI18n()
const localePath = useLocalePath()

const activeType = ref<'all' | TaggedContentType>('all')
const tagSlug = computed(() => normalizeTagSlug(String(route.params.slug || '')))
const allItems = computed(() => getTaggedContent(locale.value))
const matchedItems = computed(() =>
  allItems.value.filter((item) => item.tagSlugs.includes(tagSlug.value))
)
const filteredItems = computed(() =>
  activeType.value === 'all'
    ? matchedItems.value
    : matchedItems.value.filter((item) => item.type === activeType.value)
)
const featuredItem = computed(() => filteredItems.value[0])
const remainingItems = computed(() => filteredItems.value.slice(1))
const tagLabel = computed(() => {
  const tag = matchedItems.value
    .flatMap((item) => item.tags)
    .find((tag) => normalizeTagSlug(tag) === tagSlug.value)

  return tag || getTagLabel(tagSlug.value)
})
const counts = computed(() => ({
  all: matchedItems.value.length,
  blog: matchedItems.value.filter((item) => item.type === 'blog').length,
  lab: matchedItems.value.filter((item) => item.type === 'lab').length,
  project: matchedItems.value.filter((item) => item.type === 'project').length
}))
const tabs = computed(() => [
  { type: 'all' as const, label: t('tags.all'), count: counts.value.all },
  { type: 'blog' as const, label: t('tags.writing'), count: counts.value.blog },
  { type: 'lab' as const, label: t('tags.lab'), count: counts.value.lab },
  { type: 'project' as const, label: t('tags.projects'), count: counts.value.project }
])
const activeTypeNames = computed(() =>
  tabs.value
    .filter((tab) => tab.type !== 'all' && tab.count > 0)
    .map((tab) => tab.label)
    .join(locale.value === 'fa' ? '، ' : ', ')
)
const relatedTags = computed(() => {
  const tagCounts = new Map<string, { label: string; count: number }>()

  for (const item of matchedItems.value) {
    for (const tag of item.tags) {
      const slug = normalizeTagSlug(tag)

      if (!slug || slug === tagSlug.value) {
        continue
      }

      const current = tagCounts.get(slug)
      tagCounts.set(slug, {
        label: current?.label || tag,
        count: (current?.count || 0) + 1
      })
    }
  }

  return [...tagCounts.entries()]
    .map(([slug, value]) => ({ slug, ...value }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, 10)
})

function typeLabel(type: TaggedContentType) {
  return type === 'blog' ? t('tags.writing') : type === 'lab' ? t('tags.lab') : t('tags.projects')
}

function cardDate(item: TaggedContentItem) {
  return item.updated || item.date
}

useMohetiosSeo({
  title: () => `${t('tags.titlePrefix')}${tagLabel.value}`,
  description: () =>
    t('tags.seoDescription', {
      tag: `${t('tags.titlePrefix')}${tagLabel.value}`,
      site: getSeoSiteName(t)
    }),
  path: () => getLocalizedPublicPath(`/tags/${tagSlug.value}`, locale.value),
  locale: () => locale.value,
  type: 'website',
  noindex: () => !matchedItems.value.length
})
</script>

<template>
  <UPage>
    <UPageHeader
      :title="`${t('tags.titlePrefix')}${tagLabel}`"
      :description="
        t('tags.description', {
          count: counts.all,
          types: activeTypeNames || `${t('tags.writing')}, ${t('tags.lab')}, ${t('tags.projects')}`
        })
      "
    >
      <template #headline>
        <UBadge color="neutral" variant="outline">
          {{ t('tags.eyebrow') }}
        </UBadge>
      </template>
    </UPageHeader>

    <UPageBody>
      <div class="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <main class="min-w-0 space-y-8">
          <div class="flex flex-wrap gap-2 border-y border-default py-4">
            <UButton
              v-for="tab in tabs"
              :key="tab.type"
              color="neutral"
              :variant="activeType === tab.type ? 'solid' : 'ghost'"
              size="sm"
              @click="activeType = tab.type"
            >
              {{ tab.label }} {{ tab.count }}
            </UButton>
          </div>

          <section v-if="featuredItem" class="space-y-4">
            <p class="text-xs font-medium uppercase tracking-widest text-muted">
              {{ t('tags.latest') }}
            </p>
            <article class="rounded-lg border border-default bg-default p-6 sm:p-7">
              <div class="mb-5 flex flex-wrap items-center gap-3">
                <UBadge color="neutral" variant="outline">
                  {{ typeLabel(featuredItem.type) }}
                </UBadge>
                <ContentMeta
                  :date="featuredItem.date"
                  :updated="featuredItem.updated"
                  :status="featuredItem.status"
                />
              </div>
              <h2 class="text-2xl font-semibold tracking-tight text-highlighted sm:text-3xl">
                <NuxtLink :to="toPublicPath(featuredItem.path)" class="hover:underline">
                  {{ featuredItem.title }}
                </NuxtLink>
              </h2>
              <p
                v-if="featuredItem.description"
                class="mt-4 max-w-3xl text-sm leading-7 text-muted"
              >
                {{ featuredItem.description }}
              </p>
              <ContentTags class="mt-5" :tags="featuredItem.tags" />
            </article>
          </section>

          <section v-if="remainingItems.length" class="space-y-4">
            <h2 class="text-xl font-semibold tracking-tight text-highlighted">
              {{ t('tags.results') }}
            </h2>
            <div class="grid gap-4 md:grid-cols-2">
              <article
                v-for="item in remainingItems"
                :key="item.id"
                class="rounded-lg border border-default bg-default p-5"
              >
                <div class="mb-4 flex flex-wrap items-center gap-3">
                  <UBadge color="neutral" variant="outline" size="sm">
                    {{ typeLabel(item.type) }}
                  </UBadge>
                  <ContentMeta :date="cardDate(item)" :status="item.status" />
                </div>
                <h3 class="text-lg font-semibold tracking-tight text-highlighted">
                  <NuxtLink :to="toPublicPath(item.path)" class="hover:underline">
                    {{ item.title }}
                  </NuxtLink>
                </h3>
                <p v-if="item.description" class="mt-2 line-clamp-3 text-sm leading-6 text-muted">
                  {{ item.description }}
                </p>
                <ContentTags class="mt-4" :tags="item.tags" size="xs" />
              </article>
            </div>
          </section>

          <div v-if="!matchedItems.length" class="space-y-5">
            <UiEmpty :title="t('tags.emptyTitle')" :description="t('tags.emptyDescription')" />
            <div class="flex flex-wrap gap-2">
              <UButton :to="localePath('/blog')" color="neutral" variant="subtle">
                {{ t('tags.backToWriting') }}
              </UButton>
              <UButton :to="localePath('/projects')" color="neutral" variant="ghost">
                {{ t('nav.projects') }}
              </UButton>
            </div>
          </div>
        </main>

        <aside class="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <UCard variant="subtle">
            <div class="space-y-4">
              <h2 class="text-sm font-semibold tracking-tight text-highlighted">
                {{ t('tags.counts') }}
              </h2>
              <dl class="space-y-2 text-sm">
                <div
                  v-for="tab in tabs.slice(1)"
                  :key="tab.type"
                  class="flex items-center justify-between gap-4"
                >
                  <dt class="text-muted">{{ tab.label }}</dt>
                  <dd class="font-medium text-highlighted">{{ tab.count }}</dd>
                </div>
              </dl>
            </div>
          </UCard>

          <UCard v-if="relatedTags.length" variant="subtle">
            <div class="space-y-4">
              <h2 class="text-sm font-semibold tracking-tight text-highlighted">
                {{ t('tags.related') }}
              </h2>
              <div class="flex flex-wrap gap-2">
                <NuxtLink
                  v-for="tag in relatedTags"
                  :key="tag.slug"
                  :to="localePath(`/tags/${tag.slug}`)"
                  class="inline-flex"
                >
                  <UBadge color="neutral" variant="soft" class="hover:bg-muted">
                    {{ tag.label }} {{ tag.count }}
                  </UBadge>
                </NuxtLink>
              </div>
            </div>
          </UCard>
        </aside>
      </div>
    </UPageBody>
  </UPage>
</template>
