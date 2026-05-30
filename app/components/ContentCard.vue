<script setup lang="ts">
defineProps<{
  title: string
  description: string
  to: string
  date?: string | Date
  badge?: string
  tags?: string[]
  thumbnail?: string
  hideMedia?: boolean
}>()

const { locale } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <UPageCard :title="title" :description="description" :to="to" variant="subtle" class="h-full">
    <template v-if="!hideMedia" #header>
      <ContentCardMedia
        :title="title"
        :thumbnail="thumbnail"
        image-class="aspect-video w-full rounded-md object-cover"
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
        <NuxtLink
          v-for="tag in tags"
          :key="tag"
          :to="localePath(`/tags/${normalizeTagSlug(tag)}`)"
          class="inline-flex"
          @click.stop
        >
          <UBadge color="neutral" variant="soft" size="sm" class="hover:bg-muted">
            {{ tag }}
          </UBadge>
        </NuxtLink>
      </div>
    </template>
  </UPageCard>
</template>
