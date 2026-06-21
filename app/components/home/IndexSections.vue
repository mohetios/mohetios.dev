<script setup lang="ts">
const { locale, t } = useI18n()
const localePath = useLocalePath()
const homeIndexLimit = 5

const posts = computed(() => getBlogPosts(locale.value, homeIndexLimit))
const labNotes = computed(() => getLabNotes(locale.value, homeIndexLimit))
const projects = computed(() => getProjects(locale.value, homeIndexLimit))
const sectionNumber = (value: number) =>
  formatLocalizedNumber(String(value).padStart(2, '0'), locale.value)
const itemNumber = (index: number) => formatListNumber(index, locale.value)
</script>

<template>
  <section class="pb-8">
    <div
      class="grid divide-y divide-default border-b border-default lg:grid-cols-3 lg:items-stretch"
    >
      <article id="workbench" class="flex min-w-0 flex-col py-5 lg:pe-6">
        <header class="mb-5 flex items-center gap-4">
          <!-- <UIcon name="i-lucide-lamp" class="size-10 shrink-0 text-primary" /> -->
          <span class="text-sm font-semibold tabular-nums text-primary">
            {{ sectionNumber(1) }}
          </span>
          <h2 class="mh-display text-xl leading-tight font-semibold text-highlighted">
            {{ t('home.workbench.title') }}
          </h2>
        </header>

        <div v-if="labNotes.length" class="flex-1 divide-y divide-default">
          <NuxtLink
            v-for="(item, index) in labNotes"
            :key="item.id"
            :to="toPublicPath(item.path)"
            class="group flex min-h-24 py-3.5"
          >
            <div class="w-full space-y-1">
              <div
                class="flex gap-3 text-sm font-semibold text-highlighted group-hover:text-primary"
              >
                <span class="shrink-0 tabular-nums text-xl text-muted">
                  {{ itemNumber(index) }}
                </span>
                <span>{{ item.title }}</span>
              </div>
              <p class="line-clamp-2 ps-8 text-sm leading-6 text-muted">
                {{ item.description }}
              </p>
            </div>
          </NuxtLink>
        </div>
        <div v-else class="flex min-h-24 flex-1 items-center">
          <UiEmpty :title="t('empty.labTitle')" :description="t('empty.labDescription')" />
        </div>

        <UButton
          :to="localePath('/lab')"
          color="neutral"
          variant="link"
          trailing-icon="i-lucide-arrow-right"
          class="mt-auto px-0 pt-4 rtl:[&_.iconify:last-child]:rotate-180"
        >
          {{ t('home.workbench.viewAll') }}
        </UButton>
      </article>

      <article id="notebook" class="flex min-w-0 flex-col py-5 lg:px-6">
        <header class="mb-5 flex items-center gap-4">
          <!-- <UIcon name="i-lucide-book-open" class="size-10  shrink-0 text-primary" /> -->
          <span class="text-sm font-semibold tabular-nums text-primary">
            {{ sectionNumber(2) }}
          </span>
          <h2 class="mh-display text-xl leading-tight font-semibold text-highlighted">
            {{ t('home.notebook.title') }}
          </h2>
        </header>

        <div v-if="posts.length" class="flex-1 divide-y divide-default">
          <NuxtLink
            v-for="(post, index) in posts"
            :key="post.id"
            :to="toPublicPath(post.path)"
            class="group flex min-h-24 py-3.5"
          >
            <div class="w-full space-y-1">
              <div
                class="flex gap-3 text-sm font-semibold text-highlighted group-hover:text-primary"
              >
                <span class="shrink-0 tabular-nums text-xl text-muted">
                  {{ itemNumber(index) }}
                </span>
                <h3 class="line-clamp-2 text-base leading-6 font-medium">
                  {{ post.title }}
                </h3>
              </div>
              <p class="line-clamp-2 ps-8 text-sm leading-6 text-muted">
                {{ post.description }}
              </p>
            </div>
          </NuxtLink>
        </div>
        <div v-else class="flex min-h-24 flex-1 items-center">
          <UiEmpty :title="t('empty.blogTitle')" :description="t('empty.blogDescription')" />
        </div>

        <UButton
          :to="localePath('/blog')"
          color="neutral"
          variant="link"
          trailing-icon="i-lucide-arrow-right"
          class="mt-auto px-0 pt-4 rtl:[&_.iconify:last-child]:rotate-180"
        >
          {{ t('home.notebook.viewAll') }}
        </UButton>
      </article>

      <article id="built-systems" class="flex min-w-0 flex-col py-5 lg:ps-6">
        <header class="mb-5 flex items-center gap-4">
          <!-- <UIcon name="i-lucide-wrench" class="size-10 shrink-0 text-primary" /> -->
          <span class="text-sm font-semibold tabular-nums text-primary">
            {{ sectionNumber(3) }}
          </span>
          <h2 class="mh-display text-xl leading-tight font-semibold text-highlighted">
            {{ t('home.builtSystems.title') }}
          </h2>
        </header>

        <div v-if="projects.length" class="flex-1 divide-y divide-default">
          <NuxtLink
            v-for="(project, index) in projects"
            :key="project.id"
            :to="toPublicPath(project.path)"
            class="group flex min-h-24 py-3.5"
          >
            <div class="w-full space-y-1">
              <div
                class="flex gap-3 text-sm font-semibold text-highlighted group-hover:text-primary"
              >
                <span class="shrink-0 tabular-nums text-xl text-muted">
                  {{ itemNumber(index) }}
                </span>
                <h3 class="line-clamp-2 text-base leading-6 font-medium">
                  {{ project.title }}
                </h3>
              </div>
              <p class="line-clamp-2 ps-8 text-sm leading-6 text-muted">
                {{ project.description }}
              </p>
            </div>
          </NuxtLink>
        </div>
        <div v-else class="flex min-h-24 flex-1 items-center">
          <UiEmpty
            :title="t('empty.projectsTitle')"
            :description="t('empty.projectsDescription')"
          />
        </div>

        <UButton
          :to="localePath('/projects')"
          color="neutral"
          variant="link"
          trailing-icon="i-lucide-arrow-right"
          class="mt-auto px-0 pt-4 rtl:[&_.iconify:last-child]:rotate-180"
        >
          {{ t('home.builtSystems.viewAll') }}
        </UButton>
      </article>
    </div>
  </section>
  <!--
  <section class="grid gap-6 py-2 sm:grid-cols-[9rem_1fr] sm:items-center">
    <div class="hidden border-e border-default pe-8 sm:block">
      <UIcon name="i-lucide-pen-line" class="size-10 text-muted" />
    </div>
    <p
      class="mh-display max-w-3xl text-2xl leading-tight font-medium text-balance text-highlighted sm:text-3xl"
    >
      {{ t('home.closing.quote') }}
    </p>
  </section> -->
</template>
