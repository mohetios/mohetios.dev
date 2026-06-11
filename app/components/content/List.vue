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
  <NuxtLink
    v-if="plain"
    :to="publicTo"
    class="group block py-2.5 no-underline transition-colors duration-150"
  >
    <p
      class="text-reader-sm font-medium leading-(--text-reader-sm--line-height) text-highlighted transition-colors duration-150 group-hover:text-primary"
    >
      {{ title }}
    </p>
    <p
      v-if="description"
      class="mt-1 text-ui-sm leading-(--text-ui-sm--line-height) text-muted"
    >
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
