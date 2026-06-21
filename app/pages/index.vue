<script setup lang="ts">
const { locale, t } = useI18n()
const hydrate = useBoosterHydrate()
const HomeIndexSections = hydrate(() => import('~/components/home/IndexSections.vue'))

useMohetiosSeo({
  description: () => t('site.description'),
  path: () => getLocalizedPublicPath('/', locale.value),
  locale: () => locale.value,
  type: 'website'
})
</script>

<template>
  <UPage class="mh-page">
    <UPageBody :ui="{ base: 'space-y-10 pb-16 sm:space-y-12' }">
      <section
        id="workshop"
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

        <figure class="relative overflow-hidden lg:-mx-[10%]">
          <NuxtImg
            src="/page-images/home.webp"
            :alt="t('home.hero.imageAlt')"
            loading="eager"
            fetchpriority="high"
            class="aspect-[4/3] w-full object-contain opacity-90 dark:hidden"
            sizes="xs:100vw md:42vw lg:624px"
          />
          <NuxtImg
            src="/page-images/home-dark.webp"
            alt=""
            aria-hidden="true"
            loading="eager"
            fetchpriority="high"
            class="hidden aspect-[4/3] w-full object-contain opacity-85 dark:block"
            sizes="xs:100vw md:42vw lg:624px"
          />
        </figure>
      </section>

      <HomeIndexSections />
    </UPageBody>
  </UPage>
</template>
