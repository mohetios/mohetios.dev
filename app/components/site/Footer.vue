<script setup lang="ts">
import { PUBLIC_SITE_SHELL_CLASS } from '~~/shared/constants/layout'

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
      { label: t('nav.blog'), to: localePath('/blog') },
      { label: t('nav.lab'), to: localePath('/lab') },
      { label: t('nav.projects'), to: localePath('/projects') },
      { label: t('nav.about'), to: localePath('/about') },
      { label: t('nav.contact'), to: localePath('/contact') }
    ]
  },
  {
    title: t('footer.sections.connect'),
    links: [
      {
        label: 'GitHub',
        to: 'https://github.com/mehotkhan',
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
      }
    ]
  }
])
</script>

<template>
  <footer
    class="relative overflow-hidden bg-(--color-surface) text-(--color-text) after:pointer-events-none after:absolute after:inset-0 after:opacity-74 after:content-[''] after:bg-[linear-gradient(180deg,var(--color-surface)_0%,transparent_44%),radial-gradient(circle_at_12%_88%,color-mix(in_oklab,var(--color-pattern-green)_64%,transparent)_0,transparent_34%),radial-gradient(circle_at_88%_82%,color-mix(in_oklab,var(--color-pattern-blue)_62%,transparent)_0,transparent_32%)] dark:after:opacity-[0.42]"
  >
    <div :class="[PUBLIC_SITE_SHELL_CLASS, 'relative z-[2]']">
      <div
        class="grid gap-12 pt-16 pb-[3.25rem] md:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)] md:items-start"
      >
        <section class="min-w-0" :aria-label="t('site.name')">
          <NuxtLink
            :to="localePath('/')"
            class="group/logo inline-flex items-center gap-[0.85rem] text-(--color-text) no-underline"
            :aria-label="t('site.name')"
          >
            <img
              src="/icons/android-chrome-512x512.png"
              alt=""
              width="72"
              height="72"
              class="block size-[4.5rem] shrink-0 object-contain"
              aria-hidden="true"
            />
            <SiteLogo show-tagline size="footer" />
          </NuxtLink>

          <p class="mt-6 text-[0.98rem] leading-[1.8] text-pretty text-(--color-muted)">
            {{ t('site.description') }}
          </p>

          <div class="mt-6 flex flex-wrap gap-3">
            <UButton :to="localePath('/blog')" trailing-icon="i-lucide-arrow-right">
              {{ t('actions.readBlog') }}
            </UButton>
            <UButton :to="localePath('/projects')" color="neutral" variant="subtle">
              {{ t('actions.viewProjects') }}
            </UButton>
          </div>
        </section>

        <nav
          class="grid gap-8 md:grid-cols-2"
          :aria-label="t('footer.navigationLabel')"
        >
          <section v-for="section in footerSections" :key="section.title">
            <h2
              class="text-xs font-bold tracking-[0.12em] text-(--color-text) uppercase rtl:tracking-normal"
            >
              {{ section.title }}
            </h2>
            <ul class="mt-4 grid gap-3">
              <li v-for="link in section.links" :key="link.to">
                <NuxtLink
                  :to="link.to"
                  class="inline-flex items-center gap-[0.45rem] text-[0.925rem] font-medium text-(--color-muted) no-underline transition-[color,transform] duration-[160ms] hover:-translate-y-px hover:text-(--color-primary) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-primary)"
                  :target="link.external ? '_blank' : undefined"
                  :rel="link.external ? 'noopener noreferrer' : undefined"
                >
                  <UIcon v-if="link.icon" :name="link.icon" class="size-4" />
                  <span>{{ link.label }}</span>
                  <UIcon v-if="link.external" name="i-lucide-arrow-up-right" class="size-3.5" />
                </NuxtLink>
              </li>
            </ul>
          </section>
        </nav>
      </div>

      <div
        class="flex flex-col justify-between gap-4 border-t border-default py-5 pb-8 text-[0.875rem] text-(--color-muted) sm:flex-row"
      >
        <p>{{ t('site.footer') }}</p>
        <p>© {{ currentYear }} {{ t('site.name') }}</p>
      </div>
    </div>
  </footer>
</template>
