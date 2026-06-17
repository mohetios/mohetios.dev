<script setup lang="ts">
const props = defineProps<{
  title: string
  description?: string
  to: string
  date?: string | Date
  updated?: string | Date
  status?: string
  tags?: string[]
  thumbnail?: string
  repo?: string
  website?: string
  actionLabel: string
  hideMedia?: boolean
}>()

const publicTo = computed(() => toPublicPath(props.to))
</script>

<template>
  <UPageCard :to="publicTo" variant="subtle" class="h-full overflow-hidden">
    <template v-if="!hideMedia" #header>
      <ContentCardMedia :title="title" :thumbnail="thumbnail" sizes="xs:100vw md:50vw lg:520px" />
    </template>

    <template #leading>
      <ContentMeta :date="date" :updated="updated" :status="status" />
    </template>

    <h3 class="text-base font-semibold tracking-tight text-highlighted">
      {{ title }}
    </h3>
    <p v-if="description" class="mt-2 text-base leading-7 text-muted">
      {{ description }}
    </p>

    <template #footer>
      <div class="space-y-4">
        <ContentTags :tags="tags" />
        <div class="flex flex-wrap items-center gap-2">
          <UButton
            :to="publicTo"
            color="neutral"
            variant="subtle"
            size="sm"
            trailing-icon="i-lucide-arrow-right"
          >
            {{ actionLabel }}
          </UButton>
          <UButton
            v-if="repo"
            :to="repo"
            color="neutral"
            variant="ghost"
            size="sm"
            icon="i-lucide-github"
            target="_blank"
          />
          <UButton
            v-if="website"
            :to="website"
            color="neutral"
            variant="ghost"
            size="sm"
            icon="i-lucide-external-link"
            target="_blank"
          />
        </div>
      </div>
    </template>
  </UPageCard>
</template>
