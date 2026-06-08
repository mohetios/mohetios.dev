<script setup lang="ts">
const { t, te } = useI18n()

withDefaults(
  defineProps<{
    showTagline?: boolean
    captionKey?: string
    size?: 'header' | 'footer' | 'dashboard'
  }>(),
  {
    showTagline: false,
    captionKey: 'site.tagline',
    size: 'header'
  }
)

const showTld = computed(() => te('site.logo.tld') && Boolean(t('site.logo.tld')))
</script>

<template>
  <span class="site-logo" :class="`site-logo--${size}`">
    <span class="site-logo__wordmark" aria-hidden="true">
      <span class="site-logo__part1">{{ t('site.logo.part1') }}</span>
      <span class="site-logo__part2">{{ t('site.logo.part2') }}</span>
      <span v-if="showTld" class="site-logo__tld">
        <span class="site-logo__dot">.</span>{{ t('site.logo.tld') }}
      </span>
    </span>
    <span v-if="showTagline" class="site-logo__tagline">{{ t(captionKey) }}</span>
  </span>
</template>
