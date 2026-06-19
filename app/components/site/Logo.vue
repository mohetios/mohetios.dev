<script setup lang="ts">
const props = withDefaults(
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

const { t, te } = useI18n()

const logoParts = computed(() => getLogoParts(t))

const showTld = computed(() => te('site.logo.tld') && Boolean(t('site.logo.tld')))

const motion = 'transition-colors duration-150 ease-out'

const sizeStyles = {
  header: {
    root: 'inline-flex min-w-0 items-center gap-3',
    part1: 'text-2xl',
    part2: 'text-xl',
    tld: 'text-base',
    tagline: [
      'hidden shrink-0 text-sm text-muted opacity-90',
      'whitespace-nowrap xl:inline',
      "before:me-3 before:inline-block before:h-3.5 before:w-px before:bg-border before:align-middle before:content-['']"
    ].join(' ')
  },
  footer: {
    root: 'inline-flex flex-col items-start',
    part1: 'text-4xl',
    part2: 'text-3xl',
    tld: 'text-lg',
    tagline: 'mt-1 text-base leading-6 text-muted opacity-90'
  },
  dashboard: {
    root: 'inline-flex min-w-0 flex-wrap items-baseline gap-x-1.5 gap-y-1',
    part1: 'text-xl',
    part2: 'text-lg',
    tld: 'text-sm',
    tagline: [
      'inline text-xs font-medium uppercase tracking-wide text-muted opacity-90 rtl:normal-case',
      'transition-colors duration-150 ease-out'
    ].join(' ')
  }
} as const

const styles = computed(() => sizeStyles[props.size])

const part1Class = computed(() =>
  [styles.value.part1, motion, 'font-semibold text-highlighted rtl:font-bold'].join(' ')
)

const part2Class = computed(() =>
  [styles.value.part2, motion, 'font-medium text-primary rtl:font-semibold'].join(' ')
)

const tldClass = computed(() =>
  [styles.value.tld, motion, 'font-mono font-medium text-muted'].join(' ')
)
</script>

<template>
  <span :class="styles.root">
    <span class="inline-flex items-baseline whitespace-nowrap" aria-hidden="true">
      <span :class="part1Class">{{ logoParts.part1 }}</span>
      <span :class="part2Class">{{ logoParts.part2 }}</span>
      <span v-if="showTld" :class="tldClass">
        <span class="text-(--mh-craft)">.</span>{{ t('site.logo.tld') }}
      </span>
    </span>
    <span v-if="showTagline" :class="styles.tagline">{{ t(captionKey) }}</span>
  </span>
</template>
