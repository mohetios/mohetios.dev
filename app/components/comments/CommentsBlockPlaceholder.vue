<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <section
    class="comments-section mohetios-site-column min-w-0"
    aria-busy="true"
    :aria-label="t('comments.loading')"
  >
    <div class="comments-section__inner">
      <header class="comments-section__header">
        <div class="flex items-start gap-3">
          <USkeleton class="size-10 shrink-0 rounded-xl" />

          <div class="min-w-0 flex-1 space-y-2">
            <USkeleton class="h-7 w-36 max-w-full" />
            <USkeleton class="h-4 w-full max-w-2xl" />
            <USkeleton class="h-4 w-4/5 max-w-xl" />
          </div>
        </div>
      </header>

      <div class="comments-section__composer">
        <div class="space-y-3">
          <USkeleton class="h-28 w-full rounded-lg" />
          <div class="flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <USkeleton class="h-9 w-full flex-1 rounded-md" />
            <USkeleton class="h-9 w-full flex-1 rounded-md" />
            <USkeleton class="h-9 w-28 shrink-0 rounded-md" />
          </div>
        </div>
      </div>

      <div class="comments-section__list">
        <div class="comments-section__list-header">
          <USkeleton class="h-4 w-36" />
        </div>

        <div class="space-y-3">
          <USkeleton v-for="index in 2" :key="index" class="h-28 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.comments-section__inner {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.comments-section__composer {
  border-radius: 0.75rem;
  background: color-mix(in oklab, var(--ui-bg-muted) 45%, transparent);
  padding: 1.25rem;
}

@media (min-width: 640px) {
  .comments-section__composer {
    padding: 1.5rem;
  }
}

.comments-section__list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.comments-section__list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding-bottom: 0.25rem;
}
</style>
