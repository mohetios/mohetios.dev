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
  <header class="border-b border-default bg-default">
    <div class="mohetios-editorial-header pb-10 pt-8">
      <NuxtLink
        v-if="backTo"
        :to="backTo"
        class="mb-8 inline-flex items-center gap-2 text-ui-sm text-muted transition-colors hover:text-highlighted"
      >
        <UIcon name="i-lucide-arrow-left" class="size-4" />
        {{ backLabel }}
      </NuxtLink>

      <p
        v-if="status"
        class="text-ui-xs font-medium uppercase tracking-[0.2em] text-primary"
      >
        {{ status }}
      </p>

      <h1 class="mt-3 break-words text-balance text-3xl font-semibold tracking-tight text-highlighted sm:text-4xl lg:text-[2.5rem] lg:leading-[1.12]">
        {{ title }}
      </h1>

      <p
        v-if="description"
        class="mt-4 text-pretty text-reader-base leading-8 text-muted sm:text-reader-lg"
      >
        {{ description }}
      </p>

      <div
        class="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-ui-sm text-muted"
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

      <ContentTagList v-if="tags?.length" class="mt-5" :tags="tags" size="sm" />
    </div>

    <figure v-if="thumbnail" class="mohetios-editorial-hero pb-10">
      <img
        :src="thumbnail"
        :alt="imageAlt"
        class="w-full rounded-2xl border border-default object-cover"
        loading="eager"
        fetchpriority="high"
        decoding="async"
      />
      <figcaption v-if="thumbnailCredit" class="mt-3 text-center text-ui-xs leading-6 text-muted">
        {{ thumbnailCredit }}
      </figcaption>
    </figure>
  </header>
</template>
