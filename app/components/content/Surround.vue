<script setup lang="ts">
type SurroundItem = {
  title: string
  description?: string
  path: string
} | null

defineProps<{
  surround: SurroundItem[]
}>()

const { t } = useI18n()
</script>

<template>
  <div class="grid gap-6 sm:grid-cols-2">
    <NuxtLink
      v-if="surround[0]"
      :to="toPublicPath(surround[0].path)"
      class="mohetios-content-footer-link"
    >
      <span class="mohetios-content-footer-link__meta">
        <UIcon name="i-lucide-arrow-left" class="size-3.5" />
        {{ t('content.article.previous') }}
      </span>
      <span class="mohetios-content-footer-link__title">
        {{ surround[0].title }}
      </span>
    </NuxtLink>
    <div v-else class="hidden sm:block" aria-hidden="true" />

    <NuxtLink
      v-if="surround[1]"
      :to="toPublicPath(surround[1].path)"
      class="mohetios-content-footer-link sm:items-end sm:text-end"
    >
      <span class="mohetios-content-footer-link__meta sm:justify-end">
        {{ t('content.article.next') }}
        <UIcon name="i-lucide-arrow-right" class="size-3.5" />
      </span>
      <span class="mohetios-content-footer-link__title">
        {{ surround[1].title }}
      </span>
    </NuxtLink>
  </div>
</template>
