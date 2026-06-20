<script setup lang="ts">
const sidebarOpen = ref<boolean | undefined>(undefined)
</script>

<template>
  <div class="mh-page min-h-dvh w-full bg-default text-highlighted">
    <SiteHeader v-model:sidebar-open="sidebarOpen" />

    <div
      class="transition-[padding] duration-200 ease-out"
      :class="sidebarOpen === false ? 'lg:ps-0' : 'lg:ps-80'"
    >
      <main class="site-shell min-h-dvh">
        <slot />
      </main>
    </div>
  </div>
</template>
