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
      { label: t('nav.blog'), to: localePath('/blog') },
      { label: t('nav.lab'), to: localePath('/lab') },
      { label: t('nav.projects'), to: localePath('/projects') },
      { label: t('nav.about'), to: localePath('/about') }
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
  <footer class="site-footer">
    <div class="site-footer__inner">
      <section class="site-footer__brand" :aria-label="t('site.name')">
        <NuxtLink :to="localePath('/')" class="site-footer__mark" :aria-label="t('site.name')">
          <span class="logo-mark site-footer__logo">م</span>
          <span>
            <span class="logo-mark site-footer__name">{{ t('site.name') }}</span>
            <span class="site-footer__tagline">{{ t('site.tagline') }}</span>
          </span>
        </NuxtLink>

        <p class="site-footer__description">
          {{ t('site.description') }}
        </p>

        <div class="site-footer__actions">
          <UButton :to="localePath('/blog')" trailing-icon="i-lucide-arrow-right">
            {{ t('actions.readBlog') }}
          </UButton>
          <UButton :to="localePath('/projects')" color="neutral" variant="subtle">
            {{ t('actions.viewProjects') }}
          </UButton>
        </div>
      </section>

      <nav class="site-footer__nav" :aria-label="t('footer.navigationLabel')">
        <section
          v-for="section in footerSections"
          :key="section.title"
          class="site-footer__section"
        >
          <h2 class="site-footer__heading">{{ section.title }}</h2>
          <ul class="site-footer__list">
            <li v-for="link in section.links" :key="link.to">
              <NuxtLink
                :to="link.to"
                class="site-footer__link"
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

    <div class="site-footer__bottom">
      <p>{{ t('site.footer') }}</p>
      <p>© {{ currentYear }} {{ t('site.name') }}</p>
    </div>
  </footer>
</template>
