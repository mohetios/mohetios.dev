<script setup lang="ts">
import { PUBLIC_SITE_SHELL_CLASS } from '~~/shared/constants/layout'
</script>

<template>
  <div class="flex w-full flex-col">
    <SiteHeader />

    <div :class="PUBLIC_SITE_SHELL_CLASS">
      <slot />
      <USeparator />
    </div>

    <SiteFooter />
  </div>
</template>
