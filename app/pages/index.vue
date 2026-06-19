<script setup lang="ts">
const { locale, t } = useI18n()
const localePath = useLocalePath()
const posts = computed(() => getBlogPosts(locale.value, 3))
const labNotes = computed(() => getLabNotes(locale.value, 3))
const projects = computed(() => getProjects(locale.value, 3))

useMohetiosSeo({
  description: () => t('site.description'),
  path: () => getLocalizedPublicPath('/', locale.value),
  locale: () => locale.value,
  type: 'website'
})

const workbenchItems = computed(() => {
  const firstProject = projects.value[0]
  const firstLabNote = labNotes.value.find((note) => note.path.includes('/anonymous-messaging-'))

  return [
    {
      title: t('home.workbench.email.title'),
      description: t('home.workbench.email.description'),
      to: getLocalizedPublicPath('/blog/building-small-email-client-cloudflare-workers', 'en')
    },
    {
      title: firstLabNote?.title || t('home.workbench.nekonymous.title'),
      description: firstLabNote?.description || t('home.workbench.nekonymous.description'),
      to: firstLabNote ? toPublicPath(firstLabNote.path) : localePath('/lab')
    },
    {
      title: firstProject?.title || t('home.workbench.safarnak.title'),
      description: firstProject?.description || t('home.workbench.safarnak.description'),
      to: firstProject ? toPublicPath(firstProject.path) : localePath('/projects')
    }
  ]
})

const archiveItems = computed(() => [
  { year: '2026', label: t('home.archive.items.2026') },
  { year: '2025', label: t('home.archive.items.2025') },
  { year: '2024', label: t('home.archive.items.2024') }
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
  <UPage class="mh-page">
    <UPageBody :ui="{ base: 'space-y-10 pb-16 sm:space-y-12' }">
      <section
        class="grid items-center gap-8 border-b border-default pb-8 lg:grid-cols-[0.55fr_0.45fr] lg:gap-12 lg:pb-10"
      >
        <div class="space-y-5">
          <p class="mh-kicker">
            {{ t('home.hero.kicker') }}
          </p>
          <h1
            class="mh-display max-w-3xl text-4xl leading-tight font-semibold text-balance text-highlighted sm:text-5xl lg:text-5xl"
          >
            {{ t('home.hero.title') }}
          </h1>
          <p
            class="max-w-[36rem] text-base leading-7 text-pretty text-muted sm:text-lg sm:leading-8"
          >
            {{ t('home.hero.description') }}
          </p>
        </div>

        <figure class="relative overflow-hidden">
          <NuxtImg
            src="/home-intro.png"
            :alt="t('home.hero.imageAlt')"
            loading="eager"
            fetchpriority="high"
            class="aspect-[4/3] w-full object-contain opacity-90 dark:hidden"
            sizes="xs:100vw md:42vw lg:520px"
          />
          <NuxtImg
            src="/home-intro-dark.png"
            alt=""
            aria-hidden="true"
            loading="eager"
            fetchpriority="high"
            class="hidden aspect-[4/3] w-full object-contain opacity-85 dark:block"
            sizes="xs:100vw md:42vw lg:520px"
          />
        </figure>
      </section>

      <section class="border-b border-default pb-8">
        <div
          class="grid divide-y divide-default border-b border-default lg:grid-cols-3  "
        >
          <article class="min-w-0 py-5 lg:pe-6">
            <header class="mb-5 flex items-center gap-4">
              <UIcon name="i-lucide-lamp" class="size-8 shrink-0 text-primary" />
              <span class="text-sm font-semibold tabular-nums text-primary">01</span>
              <h2 class="mh-display text-xl leading-tight font-semibold text-highlighted">
                {{ t('home.workbench.title') }}
              </h2>
            </header>

            <div class="divide-y divide-default">
              <NuxtLink
                v-for="(item, index) in workbenchItems"
                :key="item.title"
                :to="item.to"
                class="group block py-3.5"
              >
                <div class="space-y-1">
                  <div
                    class="flex gap-3 text-sm font-semibold text-highlighted group-hover:text-primary"
                  >
                    <span class="shrink-0 tabular-nums text-xl text-muted">
                      {{ String(index + 1).padStart(2, '0') }}
                    </span>
                    <span>{{ item.title }}</span>
                  </div>
                  <p class="line-clamp-2 ps-8 text-sm leading-6 text-muted">
                    {{ item.description }}
                  </p>
                </div>
              </NuxtLink>
            </div>

            <UButton
              :to="localePath('/lab')"
              color="neutral"
              variant="link"
              trailing-icon="i-lucide-arrow-right"
              class="mt-4 px-0 rtl:[&_.iconify:last-child]:rotate-180"
            >
              {{ t('home.workbench.viewAll') }}
            </UButton>
          </article>

          <article class="min-w-0 py-5 lg:px-6">
            <header class="mb-5 flex items-center gap-4">
              <UIcon name="i-lucide-book-open" class="size-8 shrink-0 text-primary" />
              <span class="text-sm font-semibold tabular-nums text-primary">02</span>
              <h2 class="mh-display text-xl leading-tight font-semibold text-highlighted">
                {{ t('home.notebook.title') }}
              </h2>
            </header>

            <div v-if="posts.length" class="divide-y divide-default">
              <NuxtLink
                v-for="(post, index) in posts"
                :key="post.id"
                :to="toPublicPath(post.path)"
                class="group block py-3.5"
              >
                <div class="space-y-1">
                  <div
                    class="flex gap-3 text-sm font-semibold text-highlighted group-hover:text-primary"
                  >
                    <span class="shrink-0 tabular-nums text-xl text-muted">
                      {{ String(index + 1).padStart(2, '0') }}
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
            <UiEmpty
              v-else
              :title="t('empty.blogTitle')"
              :description="t('empty.blogDescription')"
            />

            <UButton
              :to="localePath('/blog')"
              color="neutral"
              variant="link"
              trailing-icon="i-lucide-arrow-right"
              class="mt-4 px-0 rtl:[&_.iconify:last-child]:rotate-180"
            >
              {{ t('home.notebook.viewAll') }}
            </UButton>
          </article>

          <article class="min-w-0 py-5 lg:ps-6">
            <header class="mb-5 flex items-center gap-4">
              <UIcon name="i-lucide-wrench" class="size-8 shrink-0 text-primary" />
              <span class="text-sm font-semibold tabular-nums text-primary">03</span>
              <h2 class="mh-display text-xl leading-tight font-semibold text-highlighted">
                {{ t('home.builtSystems.title') }}
              </h2>
            </header>

            <div v-if="projects.length" class="divide-y divide-default">
              <NuxtLink
                v-for="(project, index) in projects"
                :key="project.id"
                :to="toPublicPath(project.path)"
                class="group block py-3.5"
              >
                <div class="space-y-1">
                  <div
                    class="flex gap-3 text-sm font-semibold text-highlighted group-hover:text-primary"
                  >
                    <span class="shrink-0 tabular-nums text-xl text-muted">
                      {{ String(index + 1).padStart(2, '0') }}
                    </span>
                    <h3 class="text-base leading-6 font-medium">
                      {{ project.title }}
                    </h3>
                  </div>
                  <p class="line-clamp-2 ps-8 text-sm leading-6 text-muted">
                    {{ project.description }}
                  </p>
                </div>
              </NuxtLink>
            </div>
            <UiEmpty
              v-else
              :title="t('empty.projectsTitle')"
              :description="t('empty.projectsDescription')"
            />

            <UButton
              :to="localePath('/projects')"
              color="neutral"
              variant="link"
              trailing-icon="i-lucide-arrow-right"
              class="mt-4 px-0 rtl:[&_.iconify:last-child]:rotate-180"
            >
              {{ t('home.builtSystems.viewAll') }}
            </UButton>
          </article>
        </div>
      </section>

      <section class="grid gap-6 border-b border-default pb-7 lg:grid-cols-[0.24fr_0.76fr]">
        <div class="flex items-start gap-4">
          <UIcon name="i-lucide-archive" class="size-8 shrink-0 text-primary" />
          <span class="text-sm font-semibold tabular-nums text-primary">04</span>
          <h2 class="mh-display text-xl leading-tight font-semibold text-highlighted">
            {{ t('home.archive.title') }}
          </h2>
        </div>

        <div
          class="grid divide-y divide-default sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:rtl:divide-x-reverse"
        >
          <NuxtLink
            v-for="item in archiveItems"
            :key="item.year"
            :to="localePath('/blog')"
            class="group grid grid-cols-[1fr_auto] gap-4 py-4 text-start sm:px-5 sm:py-0"
          >
            <span>
              <span class="block font-mono text-sm text-highlighted">{{ item.year }}</span>
              <span class="mt-2 block text-sm leading-6 text-muted">{{ item.label }}</span>
            </span>
            <UIcon
              name="i-lucide-arrow-right"
              class="mt-1 size-4 text-muted transition group-hover:translate-x-1 group-hover:text-primary rtl:rotate-180 rtl:group-hover:-translate-x-1"
            />
          </NuxtLink>
        </div>
      </section>

      <section class="grid gap-6 py-2 sm:grid-cols-[9rem_1fr] sm:items-center">
        <div class="hidden border-e border-default pe-8 sm:block">
          <UIcon name="i-lucide-pen-line" class="size-8 text-muted" />
        </div>
        <p
          class="mh-display max-w-3xl text-2xl leading-tight font-medium text-balance text-highlighted sm:text-3xl"
        >
          {{ t('home.closing.quote') }}
        </p>
      </section>
    </UPageBody>
  </UPage>
</template>
