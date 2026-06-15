<template>
  <div class="flex w-full flex-col">
    <SiteHeader />

    <div class="site-shell">
      <slot />
      <USeparator />
    </div>

    <SiteFooter />
  </div>
</template>
