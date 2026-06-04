<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <div
    class="mx-auto w-full max-w-[1600px] flex flex-col gap-4 pb-5 sm:pb-6"
  >
    <section class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex min-w-0 items-start gap-3">
        <UDashboardSidebarCollapse class="shrink-0 lg:hidden" />

        <div class="min-w-0">
          <h1 class="truncate text-2xl font-semibold tracking-tight text-highlighted sm:text-3xl">
            {{ title }}
          </h1>

          <p v-if="description" class="mt-1 line-clamp-2 text-sm text-muted">
            {{ description }}
          </p>
        </div>
      </div>

      <div v-if="$slots.actions" class="flex shrink-0 flex-wrap items-center gap-2">
        <slot name="actions" />
      </div>
    </section>

    <slot name="summary" />

    <slot name="filters" />

    <section
      class="grid min-h-0 gap-4 lg:h-[calc(100dvh-12.5rem)] lg:max-h-[calc(100dvh-12.5rem)] lg:grid-cols-[minmax(340px,420px)_1fr] lg:items-stretch"
    >
      <slot />
    </section>
  </div>
</template>
