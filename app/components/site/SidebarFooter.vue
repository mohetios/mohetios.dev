<script setup lang="ts">
const { locale, t } = useI18n()

const socialLinks = [
  { label: 'GitHub', to: 'https://github.com/mohetios', icon: 'i-lucide-github' },
  { label: 'LinkedIn', to: 'https://www.linkedin.com/in/ali-zemani/', icon: 'i-lucide-linkedin' },
  { label: 'X', to: 'https://x.com/mohetios', icon: 'i-lucide-twitter' },
  { label: 'Medium', to: 'https://medium.com/@mohetios', icon: 'i-lucide-book-open-text' }
]

const currentYear = computed(() => {
  const calendar = locale.value === 'fa' ? 'persian' : 'gregory'

  return new Intl.DateTimeFormat(locale.value === 'fa' ? 'fa-IR-u-ca-persian' : 'en-US', {
    year: 'numeric',
    calendar
  }).format(new Date())
})
</script>

<template>
  <footer class="relative z-10 mt-auto shrink-0 border-t border-default pt-3">
    <p class="text-xs leading-5 font-normal text-muted">
      <span class="text-sm  text-highlighted">{{ t('site.footer') }}</span>
      <span class="ms-1.5">© {{ currentYear }} {{ t('site.name') }}</span>
      <span
        class="ms-1.5 inline-flex items-center gap-1 align-middle"
        role="group"
        :aria-label="t('footer.sections.connect')"
      >
        <a
          v-for="link in socialLinks"
          :key="link.to"
          :href="link.to"
          class="text-muted hover:text-primary items-center flex"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="link.label"
        >
          <UIcon :name="link.icon" class="size-3 items-center flex " />
        </a>
      </span>
    </p>
  </footer>
</template>
