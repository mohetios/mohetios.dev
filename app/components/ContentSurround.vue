<script setup lang="ts">
type SurroundItem = {
  title: string
  description?: string
  path: string
} | null

defineProps<{
  surround: SurroundItem[]
}>()
</script>

<template>
  <div class="grid gap-3 sm:grid-cols-2">
    <UPageCard
      v-if="surround[0]"
      :to="surround[0].path"
      :title="surround[0].title"
      :description="surround[0].description"
      icon="i-lucide-arrow-left"
      variant="subtle"
    />
    <div v-else />

    <UPageCard
      v-if="surround[1]"
      :to="surround[1].path"
      :title="surround[1].title"
      :description="surround[1].description"
      trailing-icon="i-lucide-arrow-right"
      variant="subtle"
    />
  </div>
</template>
