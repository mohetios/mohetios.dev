<script setup lang="ts">
import { PUBLIC_ARTICLE_READING_CLASS, PUBLIC_VIEWPORT_BLEED_CLASS } from '~~/shared/constants/layout'

const props = defineProps<{
  title: string
  description?: string
  thumbnail?: string
  backTo?: string
  backLabel?: string
}>()

const heroRef = ref<HTMLElement | null>(null)
const hasImage = computed(() => Boolean(props.thumbnail))
const reduceMotion = ref(false)

const articleTitleClass =
  'text-[clamp(1.75rem,3.5vw,2.25rem)] font-[650] leading-(--mohetios-heading-leading) tracking-(--mohetios-heading-tracking) text-balance text-highlighted rtl:leading-[1.18] rtl:tracking-[-0.012em]'

let frame = 0

function updateHeroMotion() {
  const hero = heroRef.value

  if (!hero || !hasImage.value) {
    return
  }

  const height = hero.offsetHeight || window.innerHeight
  const scroll = Math.max(window.scrollY, 0)
  const progress = Math.min(scroll / height, 1)
  const parallax = reduceMotion.value ? 0 : scroll * 0.38
  const opacity = 1 - progress * 0.92

  hero.style.setProperty('--content-hero-parallax', `${parallax}px`)
  hero.style.setProperty('--content-hero-opacity', String(Math.max(opacity, 0)))
}

function onScroll() {
  if (frame) {
    return
  }

  frame = window.requestAnimationFrame(() => {
    frame = 0
    updateHeroMotion()
  })
}

onMounted(() => {
  reduceMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  updateHeroMotion()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)

  if (frame) {
    window.cancelAnimationFrame(frame)
  }
})
</script>

<template>
  <header
    ref="heroRef"
    class="content-hero relative isolate w-full"
    :class="
      hasImage
        ? [
            PUBLIC_VIEWPORT_BLEED_CLASS,
            'flex min-h-svh items-end justify-center overflow-hidden pt-[6.5rem] pb-14 sm:pb-[4.5rem]'
          ]
        : 'py-8 pb-10 sm:py-10 sm:pb-12 lg:pt-12'
    "
  >
    <div v-if="hasImage" class="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div
        class="content-hero__image-wrap absolute inset-x-0 -inset-y-[12%] h-[124%] w-full opacity-[var(--content-hero-opacity)] will-change-[transform,opacity]"
      >
        <img
          :src="thumbnail"
          :alt="title"
          class="content-hero__image block h-full w-full object-cover motion-reduce:scale-[1.06]"
          loading="eager"
          fetchpriority="high"
          decoding="async"
        />
      </div>
      <div
        class="content-hero__scrim absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-bg)_18%,transparent)_0%,color-mix(in_oklab,var(--color-bg)_8%,transparent)_34%,color-mix(in_oklab,var(--color-bg)_72%,transparent)_72%,color-mix(in_oklab,var(--color-bg)_94%,transparent)_100%),linear-gradient(180deg,color-mix(in_oklab,#0f1823_10%,transparent)_0%,color-mix(in_oklab,#0f1823_42%,transparent)_100%)] opacity-[calc(0.72+(1-var(--content-hero-opacity))*0.2)] dark:bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-bg)_24%,transparent)_0%,color-mix(in_oklab,var(--color-bg)_10%,transparent)_36%,color-mix(in_oklab,var(--color-bg)_78%,transparent)_74%,color-mix(in_oklab,var(--color-bg)_96%,transparent)_100%),linear-gradient(180deg,color-mix(in_oklab,#000_8%,transparent)_0%,rgb(0_0_0/58%)_100%)]"
      />
    </div>

    <div
      class="relative z-[1] w-full"
      :class="hasImage ? ['site-shell py-1'] : [PUBLIC_ARTICLE_READING_CLASS]"
    >
      <div v-if="backTo" class="mb-6 text-start">
        <NuxtLink
          :to="backTo"
          class="inline-flex items-center gap-2 text-ui-sm text-muted transition-colors hover:text-highlighted"
        >
          <UIcon name="i-lucide-arrow-left" class="size-4" />
          {{ backLabel }}
        </NuxtLink>
      </div>

      <div :class="hasImage ? 'text-center' : ''">
      <h1
        :class="
          hasImage
            ? 'text-[length:var(--mohetios-hero-title-size)] font-semibold leading-[1.08] tracking-[-0.045em] text-balance text-highlighted rtl:leading-[1.18] rtl:tracking-[-0.012em]'
            : articleTitleClass
        "
      >
        {{ title }}
      </h1>

      <p v-if="description" class="mt-4 text-reader-base text-muted">
        {{ description }}
      </p>
      </div>
    </div>
  </header>
</template>

<style scoped>
.content-hero {
  --content-hero-parallax: 0px;
  --content-hero-opacity: 1;
}

.content-hero__image {
  transform: translate3d(0, var(--content-hero-parallax), 0) scale(1.06);
}

@media (prefers-reduced-motion: reduce) {
  .content-hero__image {
    transform: scale(1.06);
  }
}
</style>
