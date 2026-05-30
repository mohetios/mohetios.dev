<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    thumbnail?: string
    sizes?: string
    imageClass?: string
    loading?: 'lazy' | 'eager'
  }>(),
  {
    sizes: 'xs:100vw sm:50vw lg:33vw',
    imageClass: 'aspect-video w-full rounded-lg object-cover',
    loading: 'lazy'
  }
)
</script>

<template>
  <NuxtImg
    v-if="thumbnail"
    :src="thumbnail"
    :alt="title"
    :loading="loading"
    :class="imageClass"
    :sizes="sizes"
    placeholder
  />
  <div
    v-else
    :class="[
      imageClass,
      'grid min-h-40 w-full place-items-center border border-default bg-muted/40 p-6'
    ]"
    aria-hidden="true"
  >
    <div class="grid size-16 place-items-center rounded-full border border-default bg-default/70">
      <UIcon name="i-lucide-image" class="size-7 text-muted" />
    </div>
  </div>
</template>
