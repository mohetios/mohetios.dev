<script setup lang="ts">
defineProps<{
  title: string
  description?: string
  thumbnail?: string
  date?: string | Date
  updated?: string | Date
  status?: string
  tags?: string[]
  imageSizes?: string
}>()
</script>

<template>
  <header class="content-hero mx-auto max-w-5xl pt-8 sm:pt-10 lg:pt-12">
    <div class="mx-auto max-w-3xl text-center">
      <ContentMeta
        class="justify-center text-sm"
        :date="date"
        :updated="updated"
        :status="status"
      />

      <h1 class="mt-5 text-4xl font-semibold leading-tight text-highlighted sm:text-5xl">
        {{ title }}
      </h1>

      <p v-if="description" class="mt-5 text-base leading-8 text-muted sm:text-lg">
        {{ description }}
      </p>

      <ContentTagList v-if="tags?.length" class="mt-6 justify-center" :tags="tags" />
    </div>

    <NuxtImg
      v-if="thumbnail"
      :src="thumbnail"
      :alt="title"
      class="mt-10 h-auto w-full rounded-2xl object-contain ring ring-default"
      :sizes="imageSizes || 'xs:100vw lg:960px'"
      loading="eager"
      fetchpriority="high"
    />
  </header>
</template>
