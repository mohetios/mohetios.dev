<script setup lang="ts">
const { locale, t } = useI18n()
const localePath = useLocalePath()
const homeIndexLimit = 5

const sections = computed(() => [
  {
    id: 'workbench',
    key: 'workbench',
    to: '/lab',
    empty: 'lab',
    items: getLabNotes(locale.value, homeIndexLimit)
  },
  {
    id: 'notebook',
    key: 'notebook',
    to: '/blog',
    empty: 'blog',
    items: getBlogPosts(locale.value, homeIndexLimit)
  },
  {
    id: 'built-systems',
    key: 'builtSystems',
    to: '/projects',
    empty: 'projects',
    items: getProjects(locale.value, homeIndexLimit)
  }
])
const sectionNumber = (value: number) =>
  formatLocalizedNumber(String(value).padStart(2, '0'), locale.value)
const itemNumber = (index: number) => formatListNumber(index, locale.value)
</script>

<template>
  <section class="pb-8">
    <div
      class="grid divide-y divide-default border-b border-default lg:grid-cols-3 lg:items-stretch lg:divide-x lg:divide-y-0"
    >
      <article
        v-for="(section, sectionIndex) in sections"
        :id="section.id"
        :key="section.id"
        class="flex min-w-0 flex-col py-5 lg:px-6 lg:first:ps-0 lg:last:pe-0"
      >
        <header class="mb-4 flex items-baseline gap-3">
          <span class="text-sm font-semibold tabular-nums text-primary">
            {{ sectionNumber(sectionIndex + 1) }}
          </span>
          <h2
            class="font-serif text-xl leading-tight font-semibold tracking-tight text-highlighted"
          >
            {{ t(`home.${section.key}.title`) }}
          </h2>
        </header>

        <div v-if="section.items.length" class="flex-1 divide-y divide-default">
          <NuxtLink
            v-for="(item, index) in section.items"
            :key="item.id"
            :to="item.path"
            class="group flex gap-3 py-3.5"
          >
            <span class="w-6 shrink-0 text-sm leading-6 tabular-nums text-dimmed">
              {{ itemNumber(index) }}
            </span>
            <div class="min-w-0 space-y-1">
              <h3
                class="line-clamp-2 text-base leading-6 font-medium text-highlighted group-hover:text-primary"
              >
                {{ item.title }}
              </h3>
              <p class="line-clamp-2 text-sm leading-6 text-muted">
                {{ item.description }}
              </p>
            </div>
          </NuxtLink>
        </div>
        <div v-else class="flex min-h-24 flex-1 items-center">
          <UiEmpty
            :title="t(`empty.${section.empty}Title`)"
            :description="t(`empty.${section.empty}Description`)"
          />
        </div>

        <UButton
          :to="localePath(section.to)"
          color="neutral"
          variant="link"
          trailing-icon="i-lucide-arrow-right"
          class="mt-auto px-0 pt-4 rtl:[&_.iconify:last-child]:rotate-180"
        >
          {{ t(`home.${section.key}.viewAll`) }}
        </UButton>
      </article>
    </div>
  </section>
</template>
