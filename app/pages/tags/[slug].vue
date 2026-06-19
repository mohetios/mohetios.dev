<script setup lang="ts">
import type { TaggedContentItem, TaggedContentType } from '~/utils/content'

const route = useRoute()
const { locale, t } = useI18n()
const localePath = useLocalePath()

const tagSlug = computed(() => normalizeTagSlug(String(route.params.slug || '')))
const allItems = computed(() => getTaggedContent(locale.value))
const matchedItems = computed(() =>
  allItems.value.filter((item) => item.tagSlugs.includes(tagSlug.value))
)
const tagLabel = computed(() => {
  const tag = matchedItems.value
    .flatMap((item) => item.tags)
    .find((tag) => normalizeTagSlug(tag) === tagSlug.value)

  return tag || getTagLabel(tagSlug.value)
})
const groupedItems = computed(() => ({
  blog: matchedItems.value.filter((item) => item.type === 'blog'),
  lab: matchedItems.value.filter((item) => item.type === 'lab'),
  project: matchedItems.value.filter((item) => item.type === 'project')
}))
const sections = computed(() =>
  [
    {
      type: 'blog' as const,
      icon: 'i-lucide-book-open',
      title: t('pages.tagPath.sections.notebook'),
      items: groupedItems.value.blog
    },
    {
      type: 'lab' as const,
      icon: 'i-lucide-flask-conical',
      title: t('pages.tagPath.sections.lab'),
      items: groupedItems.value.lab
    },
    {
      type: 'project' as const,
      icon: 'i-lucide-wrench',
      title: t('pages.tagPath.sections.systems'),
      items: groupedItems.value.project
    }
  ].filter((section) => section.items.length)
)

function typeLabel(type: TaggedContentType) {
  return type === 'blog' ? t('tags.writing') : type === 'lab' ? t('tags.lab') : t('tags.projects')
}

function itemDate(item: TaggedContentItem) {
  return item.updated || item.date
}

function formatDate(date?: string | Date) {
  if (!date) return ''

  return new Date(date).toLocaleDateString(locale.value, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

useMohetiosSeo({
  title: () => t('pages.tagPath.seoTitle', { tag: tagLabel.value }),
  description: () => t('pages.tagPath.description'),
  path: () => getLocalizedPublicPath(`/tags/${tagSlug.value}`, locale.value),
  locale: () => locale.value,
  type: 'website',
  noindex: () => !matchedItems.value.length
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
            {{ t('pages.tagPath.kicker') }}
          </p>
          <h1
            class="mh-display max-w-4xl text-4xl leading-tight font-semibold text-balance text-highlighted sm:text-5xl lg:text-6xl"
          >
            {{ t('pages.tagPath.title', { tag: tagLabel }) }}
          </h1>
          <p class="max-w-2xl text-base leading-7 text-pretty text-muted sm:text-lg sm:leading-8">
            {{ t('pages.tagPath.description') }}
          </p>
        </div>

        <div class="hidden border-y border-default py-4 lg:block">
          <p class="mh-kicker">
            {{ t('tags.counts') }}
          </p>
          <p class="mt-2 text-sm leading-6 text-muted">
            {{ matchedItems.length }}
          </p>
        </div>
      </section>

      <template v-if="sections.length">
        <section
          v-for="(section, sectionIndex) in sections"
          :key="section.type"
          class="grid gap-8 lg:grid-cols-[0.28fr_0.72fr]"
        >
          <header class="space-y-3">
            <div class="flex items-center gap-3 text-primary">
              <UIcon :name="section.icon" class="size-5" />
              <span class="text-sm font-semibold tabular-nums">
                {{ String(sectionIndex + 1).padStart(2, '0') }}
              </span>
            </div>
            <h2
              class="mh-display text-2xl leading-tight font-semibold text-highlighted sm:text-3xl"
            >
              {{ section.title }}
            </h2>
          </header>

          <div class="divide-y divide-default border-y border-default">
            <NuxtLink
              v-for="item in section.items"
              :key="item.id"
              :to="toPublicPath(item.path)"
              class="group block py-4"
            >
              <div class="grid gap-3 sm:grid-cols-[8rem_1fr_auto] sm:items-start">
                <div class="space-y-1 text-xs leading-5 text-muted">
                  <span class="block font-medium text-primary">{{ typeLabel(item.type) }}</span>
                  <time v-if="itemDate(item)" class="block">{{ formatDate(itemDate(item)) }}</time>
                  <span v-if="item.status" class="block text-primary">{{ item.status }}</span>
                </div>

                <div class="min-w-0 space-y-1">
                  <h3
                    class="text-base leading-6 font-semibold text-highlighted group-hover:text-primary sm:text-lg"
                  >
                    {{ item.title }}
                  </h3>
                  <p v-if="item.description" class="line-clamp-2 text-sm leading-6 text-muted">
                    {{ item.description }}
                  </p>
                </div>

                <UIcon
                  name="i-lucide-arrow-right"
                  class="mt-1 size-4 text-muted transition group-hover:translate-x-1 group-hover:text-primary rtl:rotate-180 rtl:group-hover:-translate-x-1"
                />
              </div>
            </NuxtLink>
          </div>
        </section>
      </template>

      <section v-else class="space-y-5 border-y border-default py-8">
        <UiEmpty
          :title="t('pages.tagPath.emptyTitle')"
          :description="t('pages.tagPath.emptyDescription')"
        />
      </section>

      <section class="border-y border-default py-6">
        <UButton
          :to="localePath('/tags')"
          color="neutral"
          variant="link"
          leading-icon="i-lucide-arrow-left"
          class="px-0 rtl:[&_.iconify:first-child]:rotate-180"
        >
          {{ t('tags.allTags') }}
        </UButton>
      </section>
    </UPageBody>
  </UPage>
</template>
