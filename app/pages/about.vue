<script setup lang="ts">
const { locale, t } = useI18n()
const localePath = useLocalePath()
const path = computed(() => `/${locale.value}/about`)
const page = computed(() => getPage(path.value))
const recentPosts = computed(() => getBlogPosts(locale.value, 3))
const buildSteps = computed(() => [
  t('pages.aboutWorkshop.buildSteps.observe'),
  t('pages.aboutWorkshop.buildSteps.draw'),
  t('pages.aboutWorkshop.buildSteps.gather'),
  t('pages.aboutWorkshop.buildSteps.build'),
  t('pages.aboutWorkshop.buildSteps.write')
])
const focusAreas = computed(() => [
  t('pages.aboutWorkshop.focus.mohetios'),
  t('pages.aboutWorkshop.focus.nekonymous'),
  t('pages.aboutWorkshop.focus.safarnak'),
  t('pages.aboutWorkshop.focus.cloudflare'),
  t('pages.aboutWorkshop.focus.productNotes')
])
const sectionNumber = (value: number) =>
  formatLocalizedNumber(String(value).padStart(2, '0'), locale.value)
const itemNumber = (index: number) => formatListNumber(index, locale.value)

if (!page.value || page.value.draft) {
  throw createError({ statusCode: 404, statusMessage: 'About page not found', fatal: true })
}

useMohetiosSeo({
  title: () => t('pages.aboutWorkshop.kicker'),
  description: () => t('pages.aboutWorkshop.description'),
  path: () => toPublicPath(page.value?.path || path.value),
  image: () => page.value?.thumbnail,
  locale: () => locale.value,
  type: 'website'
})
</script>

<template>
  <UPage v-if="page" class="mh-page">
    <UPageBody :ui="{ base: 'space-y-10 pb-16 sm:space-y-12' }">
      <section
        class="grid gap-8 border-b border-default pb-8 lg:grid-cols-[0.6fr_0.4fr] lg:items-end"
      >
        <div class="max-w-4xl space-y-5">
          <p class="mh-kicker">
            {{ t('pages.aboutWorkshop.kicker') }}
          </p>
          <h1
            class="mh-display max-w-4xl text-4xl leading-tight font-semibold text-balance text-highlighted sm:text-5xl lg:text-6xl"
          >
            {{ t('pages.aboutWorkshop.title') }}
          </h1>
          <p class="max-w-2xl text-base leading-7 text-pretty text-muted sm:text-lg sm:leading-8">
            {{ t('pages.aboutWorkshop.description') }}
          </p>
        </div>

        <div class="hidden space-y-4 lg:block">
          <figure class="flex h-80 w-full items-center justify-center overflow-hidden">
            <NuxtImg
              src="/page-images/about.webp"
              :alt="t('pages.aboutWorkshop.imageAlt')"
              class="h-full w-full object-contain opacity-90 dark:hidden"
              sizes="lg:320px"
              loading="eager"
            />
            <NuxtImg
              src="/page-images/about-dark.webp"
              alt=""
              aria-hidden="true"
              class="hidden h-full w-full object-contain opacity-85 dark:block"
              sizes="lg:320px"
              loading="eager"
            />
          </figure>

          <div class="border-y border-default py-4">
            <p class="mh-kicker">
              {{ t('pages.aboutWorkshop.focus.title') }}
            </p>
            <div class="mt-3 flex flex-wrap gap-2">
              <span v-for="area in focusAreas.slice(0, 3)" :key="area" class="text-sm text-muted">
                {{ area }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section class="grid gap-8 border-b border-default pb-8 lg:grid-cols-2">
        <article id="what-is-mohetios" class="min-w-0 border-t border-default pt-5">
          <header class="mb-4 space-y-3">
            <div class="flex items-center gap-3 text-primary">
              <UIcon name="i-lucide-book-open" class="size-5" />
              <span class="text-sm font-semibold tabular-nums">{{ sectionNumber(1) }}</span>
            </div>
            <h2
              class="mh-display text-2xl leading-tight font-semibold text-highlighted sm:text-3xl"
            >
              {{ t('pages.aboutWorkshop.what.title') }}
            </h2>
          </header>
          <p class="text-sm leading-6 text-muted sm:text-base sm:leading-7">
            {{ t('pages.aboutWorkshop.what.description') }}
          </p>
        </article>

        <article id="the-name" class="min-w-0 border-t border-default pt-5 lg:border-s lg:ps-6">
          <header class="mb-4 space-y-3">
            <div class="flex items-center gap-3 text-primary">
              <UIcon name="i-lucide-pen-line" class="size-5" />
              <span class="text-sm font-semibold tabular-nums">{{ sectionNumber(2) }}</span>
            </div>
            <h2
              class="mh-display text-2xl leading-tight font-semibold text-highlighted sm:text-3xl"
            >
              {{ t('pages.aboutWorkshop.name.title') }}
            </h2>
          </header>
          <div class="space-y-3 text-sm leading-6 text-muted sm:text-base sm:leading-7">
            <p>{{ t('pages.aboutWorkshop.name.description') }}</p>
            <p>{{ t('pages.aboutWorkshop.name.standard') }}</p>
          </div>
        </article>
      </section>

      <section id="how-i-build" class="grid gap-8 lg:grid-cols-[0.28fr_0.72fr]">
        <div class="space-y-3">
          <div class="flex items-center gap-3 text-primary">
            <UIcon name="i-lucide-wrench" class="size-5" />
            <span class="text-sm font-semibold tabular-nums">{{ sectionNumber(3) }}</span>
          </div>
          <h2 class="mh-display text-2xl leading-tight font-semibold text-highlighted sm:text-3xl">
            {{ t('pages.aboutWorkshop.how.title') }}
          </h2>
        </div>
        <div class="divide-y divide-default border-y border-default">
          <div
            v-for="(step, index) in buildSteps"
            :key="step"
            class="grid gap-3 py-4 sm:grid-cols-[3rem_1fr]"
          >
            <span class="text-sm font-semibold tabular-nums text-primary">
              {{ itemNumber(index) }}
            </span>
            <p class="text-base leading-7 text-highlighted">{{ step }}</p>
          </div>
        </div>
      </section>

      <section id="current-focus" class="grid gap-8 lg:grid-cols-[0.28fr_0.72fr]">
        <div class="space-y-3">
          <div class="flex items-center gap-3 text-primary">
            <UIcon name="i-lucide-archive" class="size-5" />
            <span class="text-sm font-semibold tabular-nums">{{ sectionNumber(4) }}</span>
          </div>
          <h2 class="mh-display text-2xl leading-tight font-semibold text-highlighted sm:text-3xl">
            {{ t('pages.aboutWorkshop.focus.title') }}
          </h2>
        </div>
        <div
          class="grid divide-y divide-default border-y border-default sm:grid-cols-2 sm:divide-x sm:divide-y-0 sm:rtl:divide-x-reverse"
        >
          <div v-for="area in focusAreas" :key="area" class="py-3 sm:px-4">
            <p class="text-sm leading-6 text-muted">{{ area }}</p>
          </div>
        </div>
      </section>

      <section
        v-if="recentPosts.length"
        id="latest-writing"
        class="grid gap-8 border-y border-default py-7 lg:grid-cols-[0.28fr_0.72fr]"
      >
        <div class="space-y-3">
          <div class="flex items-center gap-3 text-primary">
            <UIcon name="i-lucide-book-open" class="size-5" />
            <span class="text-sm font-semibold tabular-nums">{{ sectionNumber(5) }}</span>
          </div>
          <h2 class="mh-display text-2xl leading-tight font-semibold text-highlighted sm:text-3xl">
            {{ t('about.latestWriting.title') }}
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
            :key="post.id || post.path"
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

      <section
        id="contact"
        class="grid gap-4 border-y border-default py-7 sm:grid-cols-[1fr_auto] sm:items-center"
      >
        <div class="space-y-2">
          <h2 class="mh-display text-2xl leading-tight font-semibold text-highlighted sm:text-3xl">
            {{ t('about.contactCta.title') }}
          </h2>
          <p class="text-sm leading-6 text-muted">
            {{ t('about.contactCta.description') }}
          </p>
        </div>
        <UButton
          :to="localePath('/contact')"
          color="neutral"
          variant="subtle"
          trailing-icon="i-lucide-arrow-right"
          class="rtl:[&_.iconify:last-child]:rotate-180"
        >
          {{ t('about.contactCta.action') }}
        </UButton>
      </section>
    </UPageBody>
  </UPage>
</template>
