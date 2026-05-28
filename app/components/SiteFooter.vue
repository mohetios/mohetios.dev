<script setup lang="ts">
const { locale, t } = useI18n()

const currentYear = computed(() => {
  const calendar = locale.value === 'fa' ? 'persian' : 'gregory'

  return new Intl.DateTimeFormat(locale.value === 'fa' ? 'fa-IR-u-ca-persian' : 'en-US', {
    year: 'numeric',
    calendar
  }).format(new Date())
})
</script>

<template>
  <UFooter>
    <template #left>
      <p class="text-sm text-muted">{{ t('site.name') }} - {{ t('site.tagline') }}</p>
    </template>

    <template #right>
      <p class="text-sm text-muted">{{ t('site.footer') }} © {{ currentYear }}</p>
    </template>
  </UFooter>
</template>
