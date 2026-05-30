<script setup lang="ts">
defineProps<{
  title: string
  description?: string
  to: string
  date?: string | Date
  updated?: string | Date
  badge?: string
  tags?: string[]
  thumbnail?: string
  actionLabel: string
  placeholder: string
}>()
</script>

<template>
  <article
    class="grid overflow-hidden rounded-2xl border border-default bg-default md:grid-cols-[0.9fr_1.1fr]"
  >
    <NuxtImg
      v-if="thumbnail"
      :src="thumbnail"
      :alt="title"
      class="aspect-[4/3] h-full w-full object-cover md:aspect-auto"
      loading="eager"
      sizes="xs:100vw md:42vw lg:520px"
      placeholder
    />
    <div
      v-else
      class="flex aspect-[4/3] min-h-64 w-full flex-col items-center justify-center gap-4 bg-muted/40 p-8 text-xs font-medium uppercase tracking-widest text-muted md:aspect-auto md:h-full"
    >
      <div class="grid size-16 place-items-center rounded-full border border-default bg-default/70">
        <UIcon name="i-lucide-image" class="size-7 text-muted" />
      </div>
      <span>{{ placeholder }}</span>
    </div>

    <div class="flex flex-col justify-center p-6 sm:p-8">
      <UBadge v-if="badge" color="neutral" variant="outline" class="mb-5 w-fit">
        {{ badge }}
      </UBadge>
      <h2 class="text-2xl font-semibold tracking-tight text-highlighted sm:text-3xl">
        <NuxtLink :to="to" class="hover:underline">
          {{ title }}
        </NuxtLink>
      </h2>
      <p v-if="description" class="mt-4 text-sm leading-7 text-muted sm:text-base">
        {{ description }}
      </p>
      <div class="mt-5 space-y-4">
        <ContentMeta :date="date" :updated="updated" />
        <ContentTagList :tags="tags" />
      </div>
      <UButton
        :to="to"
        color="neutral"
        variant="subtle"
        trailing-icon="i-lucide-arrow-right"
        class="mt-7 w-fit"
      >
        {{ actionLabel }}
      </UButton>
    </div>
  </article>
</template>
