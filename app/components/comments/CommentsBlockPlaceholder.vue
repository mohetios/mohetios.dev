<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <section
    class="flex min-w-0 w-full flex-col gap-6"
    aria-busy="true"
    :aria-label="t('comments.loading')"
  >
    <header class="space-y-2">
      <USkeleton class="h-4 w-28" />
      <USkeleton class="h-4 w-full max-w-md" />
    </header>

    <div class="space-y-3">
      <USkeleton class="h-24 w-full rounded-lg" />
      <div class="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <USkeleton class="h-9 w-full flex-1 rounded-md" />
        <USkeleton class="h-9 w-full flex-1 rounded-md" />
        <USkeleton class="h-9 w-28 shrink-0 rounded-md" />
      </div>
    </div>

    <div class="space-y-3">
      <USkeleton class="h-4 w-36" />
      <USkeleton v-for="index in 2" :key="index" class="h-24 w-full rounded-lg" />
    </div>
  </section>
</template>
