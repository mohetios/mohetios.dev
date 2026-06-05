<script setup lang="ts">
type TocItem = {
  title: string
  url: string
  items?: TocItem[]
}

defineProps<{
  title?: string
  links: TocItem[]
}>()
</script>

<template>
  <div class="rounded-lg border border-default bg-default lg:hidden">
    <UAccordion
      :items="[
        {
          label: title || $t('content.mobileToc.title'),
          icon: 'i-lucide-list',
          slot: 'toc'
        }
      ]"
      variant="soft"
      size="sm"
    >
      <template #toc>
        <nav class="px-1 pb-2 text-ui-sm">
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
    </UAccordion>
  </div>
</template>
