<script setup lang="ts">
const props = defineProps<{
  title: string
  description?: string
  thumbnail?: string
  thumbnailAlt?: string
  thumbnailCredit?: string
  date?: string | Date
  updated?: string | Date
  author?: string
  readingTime?: string
  status?: string
  tags?: string[]
  backTo?: string
  backLabel?: string
}>()

const { locale, t } = useI18n()

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

const showUpdated = computed(
  () =>
    props.updated &&
    (!props.date || new Date(props.updated).getTime() !== new Date(props.date).getTime())
)

const imageAlt = computed(() => props.thumbnailAlt || props.title)
</script>

<template>
  <header>
    <div class="w-full min-w-0 pt-6 pb-8 sm:pt-8">
      <div v-if="backTo" class="mb-6">
        <NuxtLink
          :to="backTo"
          class="inline-flex items-center gap-2 text-ui-sm text-muted transition-colors hover:text-highlighted"
        >
          <UIcon name="i-lucide-arrow-left" class="size-4" />
          {{ backLabel }}
        </NuxtLink>
      </div>

      <p
        v-if="status"
        class="text-ui-xs font-medium tracking-[0.14em] text-primary uppercase"
      >
        {{ status }}
      </p>

      <h1
        class="mt-2 text-balance text-[clamp(1.75rem,3.5vw,2.25rem)] font-[650] leading-(--mohetios-heading-leading) tracking-(--mohetios-heading-tracking) text-highlighted"
      >
        {{ title }}
      </h1>

      <p v-if="description" class="mt-3 text-pretty text-reader-base text-muted">
        {{ description }}
      </p>

      <div
        class="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-ui-sm text-muted"
        role="group"
        :aria-label="t('content.article.metadata')"
      >
        <template v-if="author">
          <span>
            {{ t('content.article.by') }}
            <span class="font-medium text-highlighted">{{ author }}</span>
          </span>
          <span aria-hidden="true" class="text-dimmed">·</span>
        </template>

        <time v-if="date" :datetime="new Date(date).toISOString()">
          {{ formatDate(date) }}
        </time>

        <template v-if="showUpdated">
          <span aria-hidden="true" class="text-dimmed">·</span>
          <span>
            {{ t('content.article.updated') }}
            <time :datetime="new Date(updated!).toISOString()">{{ formatDate(updated) }}</time>
          </span>
        </template>

        <template v-if="readingTime">
          <span aria-hidden="true" class="text-dimmed">·</span>
          <span>{{ readingTime }}</span>
        </template>
      </div>

      <ContentTags v-if="tags?.length" class="mt-4" :tags="tags" size="sm" />

      <figure v-if="thumbnail" class="mt-6">
        <img
          :src="thumbnail"
          :alt="imageAlt"
          class="w-full rounded-xl object-cover"
          loading="eager"
          fetchpriority="high"
          decoding="async"
        />
        <figcaption v-if="thumbnailCredit" class="mt-2 text-center text-ui-xs text-muted">
          {{ thumbnailCredit }}
        </figcaption>
      </figure>
    </div>
  </header>
</template>
