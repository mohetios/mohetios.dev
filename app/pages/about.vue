<script setup lang="ts">
const { locale, t } = useI18n()
const localePath = useLocalePath()
const path = computed(() => `/${locale.value}/about`)
const legacyPath = computed(() => `/${locale.value}/pages/about`)
const page = computed(() => getPage(path.value) || getPage(legacyPath.value))

if (!page.value || page.value.draft) {
  throw createError({ statusCode: 404, statusMessage: 'About page not found', fatal: true })
}

const recentPosts = computed(() => getBlogPosts(locale.value, 3))

const siteSections = computed(() => [
  {
    icon: 'i-lucide-pen-line',
    title: t('home.tracks.blog.title'),
    description: t('home.tracks.blog.description'),
    to: localePath('/blog'),
    action: t('actions.readBlog')
  },
  {
    icon: 'i-lucide-flask-conical',
    title: t('home.tracks.lab.title'),
    description: t('home.tracks.lab.description'),
    to: localePath('/lab'),
    action: t('actions.exploreLab')
  },
  {
    icon: 'i-lucide-box',
    title: t('home.tracks.projects.title'),
    description: t('home.tracks.projects.description'),
    to: localePath('/projects'),
    action: t('actions.viewProjects')
  }
])

const principles = computed(() => [
  t('home.principles.items.smallUseful'),
  t('home.principles.items.preservePath'),
  t('home.principles.items.clearInterfaces'),
  t('home.principles.items.openWorkshop')
])

const cardUi = {
  root: 'min-w-0 max-w-full rounded-2xl ring-1 ring-default',
  body: 'min-w-0 p-6 sm:p-8'
}

const sidebarIntroCardUi = {
  root: 'min-w-0 max-w-full overflow-hidden rounded-2xl bg-muted/30 ring-1 ring-default',
  body: 'min-w-0 p-6'
}

const sidebarCardUi = {
  root: 'min-w-0 max-w-full overflow-hidden rounded-2xl ring-1 ring-default',
  body: 'min-w-0 p-5'
}

const sidebarButtonUi = {
  base: 'w-full max-w-full justify-center',
  label: 'whitespace-normal text-center'
}

const sidebarBadgeClass =
  'max-w-full whitespace-normal rounded-full text-start leading-snug h-auto py-1'

useMohetiosSeo({
  title: () => page.value?.title,
  description: () => page.value?.description,
  path: () => toPublicPath(page.value?.path || path.value),
  image: () => page.value?.thumbnail,
  locale: () => locale.value,
  type: 'website'
})
</script>

<template>
  <UPage v-if="page">
    <UPageHeader :title="page.title" :description="page.description">
      <template #headline>
        <UBadge color="neutral" variant="outline">
          {{ t('content.about.eyebrow') }}
        </UBadge>
      </template>
    </UPageHeader>

    <UPageBody>
      <section class="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <div class="min-w-0 space-y-6">
          <UCard :ui="cardUi">
            <ContentCodeEnhancer />
            <ContentMermaidEnhancer />

            <ContentHtml :html="page.content" class="prose prose-lg max-w-none" />

            <section
              v-if="recentPosts.length"
              class="mt-8 space-y-4 border-t border-default pt-8"
            >
              <div class="space-y-2">
                <p
                  class="text-sm font-medium tracking-[0.14em] text-muted uppercase rtl:normal-case rtl:tracking-normal"
                >
                  {{ t('about.latestWriting.title') }}
                </p>
                <p class="text-base leading-7 text-muted">
                  {{ t('about.latestWriting.description') }}
                </p>
              </div>

              <div class="flex flex-col gap-1">
                <ContentList
                  v-for="post in recentPosts"
                  :key="post.id || post.path"
                  plain
                  :title="post.title"
                  :description="post.description"
                  :to="post.path"
                  :date="post.date"
                  :updated="post.updated"
                />
              </div>

              <UButton
                :to="localePath('/blog')"
                color="neutral"
                variant="subtle"
                trailing-icon="i-lucide-arrow-right"
              >
                {{ t('actions.readBlog') }}
              </UButton>
            </section>

            <div class="mt-8 border-t border-default pt-8">
              <NewsletterSubscribe source="about" />
            </div>
          </UCard>
        </div>

        <aside class="min-w-0 w-full max-w-full space-y-5 lg:sticky lg:top-20 lg:z-[1] lg:self-start">
          <UCard :ui="sidebarIntroCardUi">
            <div class="min-w-0 space-y-4">
              <div class="min-w-0">
                <p
                  class="text-pretty text-sm font-medium tracking-[0.14em] text-primary uppercase break-words rtl:normal-case rtl:tracking-normal"
                >
                  {{ t('about.sidebar.label') }}
                </p>

                <h2
                  class="mt-2 text-pretty text-lg font-semibold leading-7 tracking-tight text-highlighted break-words"
                >
                  {{ t('about.sidebar.title') }}
                </h2>

                <p class="mt-2 text-pretty text-base leading-7 text-muted break-words">
                  {{ t('about.sidebar.description') }}
                </p>
              </div>

              <p class="text-pretty text-base leading-7 text-muted break-words">
                {{ t('home.tracks.description') }}
              </p>

              <div class="flex min-w-0 flex-wrap gap-2">
                <UBadge
                  v-for="item in principles"
                  :key="item"
                  variant="soft"
                  color="neutral"
                  :class="sidebarBadgeClass"
                >
                  {{ item }}
                </UBadge>
              </div>
            </div>
          </UCard>

          <UCard v-for="section in siteSections" :key="section.to" :ui="sidebarCardUi">
            <div class="flex min-w-0 gap-3">
              <div
                class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-toned"
              >
                <UIcon :name="section.icon" class="size-5" />
              </div>

              <div class="min-w-0 flex-1 space-y-3">
                <div class="min-w-0">
                  <h3 class="text-pretty text-base font-semibold tracking-tight text-highlighted break-words">
                    {{ section.title }}
                  </h3>

                  <p class="mt-1 text-pretty text-base leading-7 text-muted break-words">
                    {{ section.description }}
                  </p>
                </div>

                <UButton
                  :to="section.to"
                  color="neutral"
                  variant="soft"
                  size="sm"
                  class="w-full max-w-full"
                  trailing-icon="i-lucide-arrow-right"
                  :ui="sidebarButtonUi"
                >
                  {{ section.action }}
                </UButton>
              </div>
            </div>
          </UCard>

          <UCard :ui="sidebarCardUi">
            <div class="flex min-w-0 gap-3">
              <div
                class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-toned"
              >
                <UIcon name="i-lucide-mail" class="size-5" />
              </div>

              <div class="min-w-0 flex-1 space-y-3">
                <div class="min-w-0">
                  <h3 class="text-pretty text-base font-semibold tracking-tight text-highlighted break-words">
                    {{ t('about.contactCta.title') }}
                  </h3>

                  <p class="mt-1 text-pretty text-base leading-7 text-muted break-words">
                    {{ t('about.contactCta.description') }}
                  </p>
                </div>

                <UButton
                  :to="localePath('/contact')"
                  variant="soft"
                  size="sm"
                  class="w-full max-w-full"
                  trailing-icon="i-lucide-arrow-right"
                  :ui="sidebarButtonUi"
                >
                  {{ t('about.contactCta.action') }}
                </UButton>
              </div>
            </div>
          </UCard>
        </aside>
      </section>
    </UPageBody>
  </UPage>
</template>
