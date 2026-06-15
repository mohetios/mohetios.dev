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

const motion = 'transition-colors duration-300 ease-out'

const sizeStyles = {
  header: {
    root: 'inline-flex min-w-0 items-center gap-3',
    part1: 'text-xl',
    part2: 'text-lg',
    tld: 'text-sm',
    tagline: [
      'hidden shrink-0 text-sm text-muted opacity-90',
      'transition-[color,opacity] duration-300 ease-out',
      'delay-150 group-hover/logo:text-secondary group-hover/logo:opacity-100',
      'whitespace-nowrap xl:inline',
      'before:me-3 before:inline-block before:h-3.5 before:w-px before:bg-border before:align-middle before:content-[\'\']'
    ].join(' ')
  },
  footer: {
    root: 'inline-flex flex-col items-start',
    part1: 'text-2xl',
    part2: 'text-xl',
    tld: 'text-sm',
    tagline: [
      'mt-0.5 text-sm text-muted opacity-90',
      'transition-[color,opacity] duration-300 ease-out',
      'delay-150 group-hover/logo:text-secondary group-hover/logo:opacity-100'
    ].join(' ')
  },
  dashboard: {
    root: 'inline-flex min-w-0 flex-wrap items-baseline gap-x-1.5 gap-y-1',
    part1: 'text-lg',
    part2: 'text-base',
    tld: 'text-xs',
    tagline: [
      'inline text-xs font-medium uppercase tracking-wide text-muted opacity-90 rtl:normal-case',
      'transition-[color,opacity] duration-300 ease-out',
      'delay-150 group-hover/logo:text-secondary group-hover/logo:opacity-100'
    ].join(' ')
  }
} as const

const styles = computed(() => sizeStyles[props.size])

const part1Class = computed(() =>
  [
    styles.value.part1,
    motion,
    'font-extrabold text-primary group-hover/logo:text-highlighted rtl:font-bold'
  ].join(' ')
)

const part2Class = computed(() =>
  [
    styles.value.part2,
    motion,
    'delay-75 font-medium text-secondary group-hover/logo:text-primary rtl:font-semibold'
  ].join(' ')
)

const tldClass = computed(() =>
  [
    styles.value.tld,
    motion,
    'delay-100 font-mono font-medium text-muted group-hover/logo:text-toned'
  ].join(' ')
)
</script>

<template>
  <span :class="styles.root">
    <span class="inline-flex items-baseline whitespace-nowrap" aria-hidden="true">
      <span :class="part1Class">{{ logoParts.part1 }}</span>
      <span :class="part2Class">{{ logoParts.part2 }}</span>
      <span v-if="showTld" :class="tldClass">
        <span class="text-(--color-gold)">.</span>{{ t('site.logo.tld') }}
      </span>
    </span>
    <span v-if="showTagline" :class="styles.tagline">{{ t(captionKey) }}</span>
  </span>
</template>
