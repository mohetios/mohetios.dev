<script setup lang="ts">
const { t } = useI18n()

const features = [
  { key: 'console', icon: 'i-lucide-layout-dashboard' },
  { key: 'writing', icon: 'i-lucide-pen-line' },
  { key: 'projects', icon: 'i-lucide-folder-open' }
] as const

const { data: setupAvailable } = useNuxtData('auth:setup-available')

const pageKey = computed(() => (setupAvailable.value === true ? 'register' : 'login'))

const pageCopy = computed(() => ({
  eyebrow: t(`auth.layout.pages.${pageKey.value}.eyebrow`),
  title: t(`auth.layout.pages.${pageKey.value}.title`),
  description: t(`auth.layout.pages.${pageKey.value}.description`)
}))
</script>

<template>
  <div class="flex min-h-svh flex-col">
    <SiteHeader />

    <main class="site-shell flex flex-1 items-center py-10 sm:py-12">
      <div class="w-full">
        <div
          class="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-16 xl:gap-20"
        >
          <section class="space-y-8">
            <div class="space-y-3">
              <p class="text-sm font-medium tracking-[0.14em] text-primary uppercase">
                {{ pageCopy.eyebrow }}
              </p>
              <h1 class="text-4xl font-semibold tracking-tight text-balance text-highlighted sm:text-5xl">
                {{ pageCopy.title }}
              </h1>
              <p class="text-lg text-pretty leading-7 text-muted">
                {{ pageCopy.description }}
              </p>
            </div>

            <div class="hidden space-y-6 border-t border-default pt-8 lg:block">
              <div class="space-y-2">
                <p class="text-base font-medium text-highlighted">
                  {{ t('site.tagline') }}
                </p>
                <p class="text-base leading-7 text-pretty text-muted">
                  {{ t('site.description') }}
                </p>
              </div>

              <ul class="hidden space-y-4 sm:block">
                <li v-for="feature in features" :key="feature.key" class="flex gap-3">
                  <UIcon :name="feature.icon" class="mt-0.5 size-4 shrink-0 text-primary" />
                  <div class="space-y-1">
                    <p class="text-base font-medium text-highlighted">
                      {{ t(`auth.layout.features.${feature.key}.title`) }}
                    </p>
                    <p class="text-base leading-7 text-muted">
                      {{ t(`auth.layout.features.${feature.key}.description`) }}
                    </p>
                  </div>
                </li>
              </ul>

              <p class="text-sm leading-6 text-muted">
                {{ t('auth.layout.note') }}
              </p>
            </div>
          </section>

          <div class="w-full lg:justify-self-end">
            <slot />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
