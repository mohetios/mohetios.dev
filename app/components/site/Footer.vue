<script setup lang="ts">
interface FooterLink {
  label: string
  to: string
  icon?: string
  external?: boolean
}

interface FooterSection {
  title: string
  links: FooterLink[]
}

const { locale, t } = useI18n()
const localePath = useLocalePath()

const currentYear = computed(() => {
  const calendar = locale.value === 'fa' ? 'persian' : 'gregory'

  return new Intl.DateTimeFormat(locale.value === 'fa' ? 'fa-IR-u-ca-persian' : 'en-US', {
    year: 'numeric',
    calendar
  }).format(new Date())
})

const footerSections = computed<FooterSection[]>(() => [
  {
    title: t('footer.sections.explore'),
    links: [
      { label: t('nav.home'), to: localePath('/') },
      { label: t('pages.notebook.kicker'), to: localePath('/blog') },
      { label: t('nav.lab'), to: localePath('/lab') },
      { label: t('pages.systems.kicker'), to: localePath('/projects') },
      { label: t('nav.about'), to: localePath('/about') },
      { label: t('nav.contact'), to: localePath('/contact') }
    ]
  },
  {
    title: t('footer.sections.connect'),
    links: [
      {
        label: 'GitHub',
        to: 'https://github.com/mohetios',
        icon: 'i-lucide-github',
        external: true
      },
      {
        label: 'LinkedIn',
        to: 'https://www.linkedin.com/in/ali-zemani/',
        icon: 'i-lucide-linkedin',
        external: true
      },
      {
        label: 'X',
        to: 'https://x.com/ZemaniAli',
        icon: 'i-lucide-twitter',
        external: true
      },
      {
        label: 'Medium',
        to: 'https://medium.com/@mohetios',
        icon: 'i-lucide-book-open-text',
        external: true
      }
    ]
  }
])
</script>

<template>
  <footer class="border-t border-default bg-default text-highlighted">
    <div class="site-shell">
      <div
        class="grid gap-10 py-10 md:grid-cols-[minmax(0,1fr)_minmax(18rem,0.7fr)] md:items-start"
      >
        <section class="min-w-0 space-y-4" :aria-label="t('site.name')">
          <NuxtLink
            :to="localePath('/')"
            class="group/logo inline-flex text-highlighted no-underline"
            :aria-label="t('site.name')"
          >
            <SiteLogo show-tagline size="footer" />
          </NuxtLink>

          <p class="max-w-xl text-pretty text-sm leading-6 text-muted">
            {{ t('site.description') }}
          </p>

          <p class="mh-display max-w-2xl text-2xl leading-tight text-highlighted">
            {{ t('footer.workshopQuote') }}
          </p>
        </section>

        <nav class="grid gap-8 sm:grid-cols-2" :aria-label="t('footer.navigationLabel')">
          <section v-for="section in footerSections" :key="section.title">
            <h2 class="mh-kicker text-highlighted">
              {{ section.title }}
            </h2>
            <ul class="mt-4 divide-y divide-default border-y border-default">
              <li v-for="link in section.links" :key="link.to">
                <NuxtLink
                  :to="link.to"
                  class="group flex items-center justify-between gap-3 py-2.5 text-sm leading-6 text-muted no-underline transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                  :target="link.external ? '_blank' : undefined"
                  :rel="link.external ? 'noopener noreferrer' : undefined"
                >
                  <span class="inline-flex items-center gap-2">
                    <UIcon v-if="link.icon" :name="link.icon" class="size-4" />
                    <span>{{ link.label }}</span>
                  </span>
                  <UIcon
                    v-if="link.external"
                    name="i-lucide-arrow-up-right"
                    class="size-4 text-muted transition group-hover:text-primary"
                  />
                  <UIcon
                    v-else
                    name="i-lucide-arrow-right"
                    class="size-4 text-muted transition group-hover:translate-x-1 group-hover:text-primary rtl:rotate-180 rtl:group-hover:-translate-x-1"
                  />
                </NuxtLink>
              </li>
            </ul>
          </section>
        </nav>
      </div>

      <div
        class="flex flex-col justify-between gap-3 border-t border-default py-5 text-sm leading-6 text-muted sm:flex-row"
      >
        <p>{{ t('site.footer') }}</p>
        <p>© {{ currentYear }} {{ t('site.name') }}</p>
      </div>
    </div>
  </footer>
</template>
