<script setup lang="ts">
type TocItem = {
  title: string
  url: string
  items?: TocItem[]
}

defineProps<{
  title?: string
  links: TocItem[]
  highlight?: boolean
}>()
</script>

<template>
  <nav v-if="links.length" class="rounded-lg border border-default bg-default p-4 text-ui-sm">
    <p v-if="title" class="mb-3 font-medium text-highlighted">
      {{ title }}
    </p>
    <ul class="space-y-2">
      <li v-for="link in links" :key="link.url">
        <NuxtLink :to="link.url" class="text-muted hover:text-highlighted">
          {{ link.title }}
        </NuxtLink>
        <ul v-if="link.items?.length" class="mt-2 space-y-2 ps-4">
          <li v-for="child in link.items" :key="child.url">
            <NuxtLink :to="child.url" class="text-muted hover:text-highlighted">
              {{ child.title }}
            </NuxtLink>
          </li>
        </ul>
      </li>
    </ul>
  </nav>
</template>
