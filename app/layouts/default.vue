<script setup lang="ts">
const { desktopOpen } = useSiteSidebar()
</script>

<template>
  <div
    class="min-h-dvh w-full bg-default text-highlighted transition-[padding] duration-200"
    :class="{ 'lg:ps-80': desktopOpen }"
  >
    <SiteHeader />

    <main class="mx-auto min-h-dvh w-full max-w-(--ui-container) px-4 sm:px-6 lg:px-8">
      <slot />
    </main>
  </div>
</template>
