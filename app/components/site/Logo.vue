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

const rootClass = computed(() => {
  if (props.size === 'footer') {
    return 'inline-flex flex-col items-start gap-0 leading-none'
  }

  if (props.size === 'dashboard') {
    return 'inline-flex min-w-0 flex-wrap items-baseline gap-x-1.5 gap-y-1 leading-none'
  }

  return 'inline-flex items-baseline gap-[0.7rem] leading-none'
})

const part1Class = computed(() => {
  const base =
    'font-extrabold text-highlighted transition-colors duration-[180ms] group-hover/logo:text-primary'

  if (props.size === 'footer') {
    return `${base} text-[1.55rem]`
  }

  if (props.size === 'dashboard') {
    return `${base} text-[1.2rem]`
  }

  return `${base} text-[1.375rem] rtl:font-bold`
})

const part2Class = computed(() => {
  const base = [
    'font-medium bg-clip-text text-transparent',
    'bg-[linear-gradient(118deg,var(--color-primary)_0%,color-mix(in_oklab,var(--color-primary)_58%,var(--color-accent))_52%,var(--color-accent)_100%)]',
    'transition-[filter,transform] duration-[180ms]',
    'group-hover/logo:brightness-[1.12] group-hover/logo:saturate-[1.08] group-hover/logo:-translate-y-px',
    'motion-reduce:group-hover/logo:translate-y-0',
    'rtl:font-semibold'
  ].join(' ')

  if (props.size === 'footer') {
    return `${base} text-[1.45rem]`
  }

  if (props.size === 'dashboard') {
    return `${base} text-[1.12rem]`
  }

  return `${base} text-[1.28rem]`
})

const tldClass = computed(() => {
  const base =
    'font-mono font-medium tracking-[0.04em] text-muted transition-colors duration-[180ms] group-hover/logo:text-toned'

  if (props.size === 'footer') {
    return `${base} text-[0.9rem]`
  }

  if (props.size === 'dashboard') {
    return `${base} text-[0.75rem]`
  }

  return `${base} text-[0.82rem]`
})

const taglineClass = computed(() => {
  if (props.size === 'footer') {
    return 'mt-0.5 block max-w-none text-sm font-[450] tracking-[-0.01em] text-muted rtl:tracking-normal'
  }

  if (props.size === 'dashboard') {
    return 'inline max-w-none text-[0.7rem] font-medium tracking-[0.05em] text-muted uppercase rtl:tracking-normal rtl:normal-case'
  }

  return [
    'hidden max-w-56 text-[0.78rem] font-[450] leading-[1.35] tracking-[-0.01em] text-muted',
    'xl:inline',
    'before:inline-block before:me-3 before:h-4 before:w-px before:-translate-y-px before:bg-[color-mix(in_oklab,var(--ui-border)_88%,transparent)] before:align-middle before:content-[\'\']',
    'rtl:leading-[1.45] rtl:tracking-normal'
  ].join(' ')
})
</script>

<template>
  <span :class="rootClass">
    <span
      class="inline-flex items-baseline tracking-[-0.045em] whitespace-nowrap rtl:tracking-normal"
      aria-hidden="true"
    >
      <span :class="part1Class">{{ logoParts.part1 }}</span>
      <span :class="part2Class">{{ logoParts.part2 }}</span>
      <span v-if="showTld" :class="tldClass">
        <span class="text-(--color-gold)">.</span>{{ t('site.logo.tld') }}
      </span>
    </span>
    <span v-if="showTagline" :class="taglineClass">{{ t(captionKey) }}</span>
  </span>
</template>
