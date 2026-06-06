<script setup lang="ts">
const props = defineProps<{
  title: string
  description?: string
  thumbnail?: string
}>()

const heroRef = ref<HTMLElement | null>(null)
const hasImage = computed(() => Boolean(props.thumbnail))
const reduceMotion = ref(false)

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
    class="content-hero"
    :class="hasImage ? 'content-hero--immersive' : 'content-hero--compact'"
  >
    <div v-if="hasImage" class="content-hero__backdrop" aria-hidden="true">
      <div class="content-hero__image-wrap">
        <img
          :src="thumbnail"
          :alt="title"
          class="content-hero__image"
          loading="eager"
          fetchpriority="high"
          decoding="async"
        />
      </div>
      <div class="content-hero__scrim" />
    </div>

    <div class="content-hero__content">
      <h1 class="content-hero__title content-hero-title">
        {{ title }}
      </h1>

      <p v-if="description" class="content-hero__description">
        {{ description }}
      </p>
    </div>
  </header>
</template>
