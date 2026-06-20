<script setup lang="ts">
const { locale, t } = useI18n()
const localePath = useLocalePath()
const projects = computed(() => getProjects(locale.value))
const recentPosts = computed(() => getBlogPosts(locale.value, 3))

useMohetiosSeo({
  title: () => t('pages.systems.kicker'),
  description: () => t('pages.systems.description'),
  path: () => getLocalizedPublicPath('/projects', locale.value),
  locale: () => locale.value,
  type: 'website'
})
</script>

<template>
  <UPage class="mh-page">
    <UPageBody :ui="{ base: 'space-y-10 pb-16 sm:space-y-12' }">
      <section
        id="systems"
        class="grid gap-8 border-b border-default pb-8 lg:grid-cols-[0.68fr_0.32fr] lg:items-end"
      >
        <div class="max-w-4xl space-y-5">
          <p class="mh-kicker">
            {{ t('pages.systems.kicker') }}
          </p>
          <h1
            class="mh-display max-w-4xl text-4xl leading-tight font-semibold text-balance text-highlighted sm:text-5xl lg:text-6xl"
          >
            {{ t('pages.systems.title') }}
          </h1>
          <p class="max-w-2xl text-base leading-7 text-pretty text-muted sm:text-lg sm:leading-8">
            {{ t('pages.systems.description') }}
          </p>
        </div>

        <div class="hidden border-y border-default py-4 lg:block">
          <p class="mh-kicker">
            {{ t('pages.systems.status.title') }}
          </p>
          <p class="mt-2 text-sm leading-6 text-muted">
            {{ t('pages.systems.status.description') }}
          </p>
        </div>
      </section>

      <section id="system-files" class="grid gap-8 lg:grid-cols-[0.28fr_0.72fr]">
        <header class="space-y-3">
          <div class="flex items-center gap-3 text-primary">
            <UIcon name="i-lucide-folder-kanban" class="size-5" />
            <span class="text-sm font-semibold tabular-nums">01</span>
          </div>
          <h2 class="mh-display text-2xl leading-tight font-semibold text-highlighted sm:text-3xl">
            {{ t('pages.systems.filesTitle') }}
          </h2>
          <p class="text-sm leading-6 text-muted">
            {{ t('pages.systems.filesDescription') }}
          </p>
        </header>

        <div>
          <div v-if="projects.length" class="divide-y divide-default border-y border-default">
            <NuxtLink
              v-for="project in projects"
              :key="project.id"
              :to="toPublicPath(project.path)"
              class="group block py-4 transition"
            >
              <div class="grid gap-3 sm:grid-cols-[2rem_1fr_auto] sm:items-start">
                <UIcon name="i-lucide-wrench" class="mt-1 size-5 text-muted" />

                <div class="min-w-0 space-y-1">
                  <div class="flex flex-wrap items-center gap-2">
                    <h2
                      class="text-base leading-6 font-semibold text-highlighted group-hover:text-primary sm:text-lg"
                    >
                      {{ project.title }}
                    </h2>
                    <span v-if="project.status" class="text-xs font-medium text-primary">
                      {{ project.status }}
                    </span>
                  </div>
                  <p class="line-clamp-2 text-sm leading-6 text-muted">
                    {{ project.description }}
                  </p>
                  <div v-if="project.tags?.length" class="flex flex-wrap gap-2 pt-1">
                    <span
                      v-for="tag in project.tags.slice(0, 3)"
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
          </div>

          <UiEmpty
            v-else
            :title="t('empty.projectsTitle')"
            :description="t('empty.projectsDescription')"
          />
        </div>
      </section>

      <section
        id="build-state"
        class="grid gap-6 border-y border-default py-7 lg:grid-cols-[0.28fr_0.72fr]"
      >
        <div class="space-y-2">
          <div class="flex items-center gap-3 text-primary">
            <UIcon name="i-lucide-wrench" class="size-5" />
            <span class="text-sm font-semibold tabular-nums">02</span>
          </div>
          <h2 class="mh-display text-2xl font-semibold text-highlighted">
            {{ t('pages.systems.status.title') }}
          </h2>
        </div>
        <p class="text-sm leading-6 text-muted">
          {{ t('pages.systems.status.description') }}
        </p>
      </section>

      <section
        v-if="recentPosts.length"
        id="related-writing"
        class="grid gap-6 border-y border-default py-7 lg:grid-cols-[0.28fr_0.72fr]"
      >
        <div class="space-y-2">
          <div class="flex items-center gap-3 text-primary">
            <UIcon name="i-lucide-book-open" class="size-5" />
            <span class="text-sm font-semibold tabular-nums">03</span>
          </div>
          <h2 class="mh-display text-2xl font-semibold text-highlighted">
            {{ t('pages.systems.relatedTitle') }}
          </h2>
          <UButton
            :to="localePath('/blog')"
            color="neutral"
            variant="link"
            trailing-icon="i-lucide-arrow-right"
            class="px-0 rtl:[&_.iconify:last-child]:rotate-180"
          >
            {{ t('actions.readBlog') }}
          </UButton>
        </div>

        <div class="divide-y divide-default border-y border-default">
          <NuxtLink
            v-for="post in recentPosts"
            :key="post.id"
            :to="toPublicPath(post.path)"
            class="group grid gap-3 py-4 sm:grid-cols-[1fr_auto]"
          >
            <div>
              <h3
                class="text-base leading-6 font-semibold text-highlighted group-hover:text-primary"
              >
                {{ post.title }}
              </h3>
              <p class="mt-1 line-clamp-2 text-sm leading-6 text-muted">{{ post.description }}</p>
            </div>
            <UIcon
              name="i-lucide-arrow-right"
              class="mt-1 size-4 text-muted transition group-hover:translate-x-1 group-hover:text-primary rtl:rotate-180 rtl:group-hover:-translate-x-1"
            />
          </NuxtLink>
        </div>
      </section>
    </UPageBody>
  </UPage>
</template>
