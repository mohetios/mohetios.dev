<script setup lang="ts">
const props = defineProps<{
  title: string
  description?: string
  to: string
  date?: string | Date
  updated?: string | Date
  badge?: string
  status?: string
  tags?: string[]
  thumbnail?: string
  compact?: boolean
  plain?: boolean
}>()

const publicTo = computed(() => toPublicPath(props.to))
</script>

<template>
  <NuxtLink v-if="plain" :to="publicTo" class="mohetios-content-footer-list__item">
    <p class="mohetios-content-footer-list__title">
      {{ title }}
    </p>
    <p v-if="description" class="mohetios-content-footer-list__description">
      {{ description }}
    </p>
  </NuxtLink>

  <UPageCard v-else :to="publicTo" variant="subtle" class="h-full">
    <template v-if="!compact" #header>
      <ContentCardMedia :title="title" :thumbnail="thumbnail" />
    </template>

    <template #leading>
      <div class="flex flex-wrap items-center gap-2">
        <UBadge v-if="badge" color="neutral" variant="outline">
          {{ badge }}
        </UBadge>
        <ContentMeta :date="date" :updated="updated" :status="status" />
      </div>
    </template>

    <h3 class="text-ui-base font-semibold tracking-tight text-highlighted">
      {{ title }}
    </h3>
    <p v-if="description" class="mt-2 text-ui-sm leading-6 text-muted">
      {{ description }}
    </p>

    <template #footer>
      <ContentTags :tags="tags" />
    </template>
  </UPageCard>
</template>
