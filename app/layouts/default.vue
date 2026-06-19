<script setup lang="ts">
const sidebarOpen = ref(true)
</script>

<template>
  <div class="mh-page min-h-dvh w-full bg-default text-highlighted">
    <SiteHeader v-model:sidebar-open="sidebarOpen" />

    <div
      :class="['transition-[padding] duration-200 ease-out', sidebarOpen ? 'lg:ps-80' : 'lg:ps-0']"
    >
      <main class="site-shell min-h-dvh">
        <slot />
      </main>
    </div>
  </div>
</template>
