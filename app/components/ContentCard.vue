<script setup lang="ts">
defineProps<{
  title: string
  description: string
  to: string
  date?: string | Date
  badge?: string
  tags?: string[]
  thumbnail?: string
}>()

const { locale } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <UPageCard :title="title" :description="description" :to="to" variant="subtle" class="h-full">
    <template v-if="thumbnail" #header>
      <NuxtImg
        :src="thumbnail"
        :alt="title"
        loading="lazy"
        class="aspect-video w-full rounded-md object-cover"
        sizes="xs:100vw sm:50vw lg:33vw"
      />
    </template>

    <template #leading>
      <div class="flex flex-wrap items-center gap-2">
        <UBadge v-if="badge" color="neutral" variant="outline">
          {{ badge }}
        </UBadge>
        <time v-if="date" class="text-xs text-muted">
          {{
            new Date(date).toLocaleDateString(locale, {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })
          }}
        </time>
      </div>
    </template>

    <template v-if="tags?.length" #footer>
      <div class="flex flex-wrap gap-2">
        <UBadge
          v-for="tag in tags"
          :key="tag"
          :to="localePath(`/tags/${normalizeTagSlug(tag)}`)"
          color="neutral"
          variant="soft"
          size="sm"
          class="hover:bg-muted"
        >
          {{ tag }}
        </UBadge>
      </div>
    </template>
  </UPageCard>
</template>
