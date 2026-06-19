<template>
  <div class="mh-page flex min-h-dvh w-full flex-col bg-default text-highlighted">
    <SiteHeader />

    <main class="site-shell flex-1">
      <slot />
    </main>

    <SiteFooter />
  </div>
</template>
