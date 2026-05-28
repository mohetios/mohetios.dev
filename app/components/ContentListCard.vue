<script setup lang="ts">
defineProps<{
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
}>()
</script>

<template>
  <UPageCard :to="to" variant="subtle" class="h-full">
    <template v-if="thumbnail && !compact" #header>
      <NuxtImg
        :src="thumbnail"
        :alt="title"
        loading="lazy"
        class="aspect-video w-full rounded-lg object-cover"
        sizes="xs:100vw sm:50vw lg:33vw"
      />
    </template>

    <template #leading>
      <div class="flex flex-wrap items-center gap-2">
        <UBadge v-if="badge" color="neutral" variant="outline">
          {{ badge }}
        </UBadge>
        <ContentMeta :date="date" :updated="updated" :status="status" />
      </div>
    </template>

    <h3 class="text-lg font-semibold tracking-tight text-highlighted">
      {{ title }}
    </h3>
    <p v-if="description" class="mt-2 text-sm leading-6 text-muted">
      {{ description }}
    </p>

    <template #footer>
      <ContentTagList :tags="tags" />
    </template>
  </UPageCard>
</template>
