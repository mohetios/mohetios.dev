<script setup lang="ts">
import { localeDefinitions } from '~~/shared/constants/locales'

defineOptions({
  inheritAttrs: false
})

const props = defineProps<{
  title: string
  description?: string
  category?: string
  locale?: string
  siteName: string
  tagline: string
}>()

// Satori only renders embedded fonts, so OG images use the site default sans stack.
const OG_FONT_FAMILY =
  'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'

const rtlLocales = localeDefinitions
  .filter((definition) => definition.dir === 'rtl')
  .map<string>((definition) => definition.code)
const isRtl = computed(() => rtlLocales.includes(props.locale || ''))
const textAlign = computed(() => (isRtl.value ? 'right' : 'left') as 'right' | 'left')

const displayDescription = computed(() =>
  String(props.description || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120)
)

const rootStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  width: '100%',
  height: '100%',
  padding: '64px',
  backgroundColor: '#fcfbf8',
  color: '#1a2b22',
  fontFamily: OG_FONT_FAMILY
}

const headerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '24px'
}

const siteNameStyle = computed(() => ({
  fontSize: '28px',
  fontWeight: 500,
  letterSpacing: isRtl.value ? '0' : '0.08em',
  color: '#3f6d58',
  textTransform: 'none',
  fontFamily: OG_FONT_FAMILY,
  margin: 0
}))

const categoryStyle = {
  fontSize: '22px',
  color: '#4d6f5d',
  fontFamily: OG_FONT_FAMILY,
  margin: 0,
  padding: '8px 20px',
  border: '1px solid #d7e4dc',
  borderRadius: '9999px',
  backgroundColor: 'rgba(255, 255, 255, 0.7)'
}

const titleStyle = computed(() => ({
  fontSize: '68px',
  lineHeight: 1.08,
  fontWeight: 600,
  letterSpacing: isRtl.value ? '-0.01em' : '-0.03em',
  color: '#102018',
  fontFamily: OG_FONT_FAMILY,
  margin: 0,
  textAlign: textAlign.value,
  maxWidth: '980px'
}))

const descriptionStyle = computed(() => ({
  fontSize: '30px',
  lineHeight: 1.45,
  color: '#4f6358',
  fontFamily: OG_FONT_FAMILY,
  margin: '32px 0 0',
  textAlign: textAlign.value,
  maxWidth: '900px'
}))

const taglineStyle = computed(() => ({
  fontSize: '24px',
  color: '#6a7f74',
  fontFamily: OG_FONT_FAMILY,
  margin: 0,
  textAlign: textAlign.value
}))
</script>

<template>
  <div :style="rootStyle" :dir="isRtl ? 'rtl' : 'ltr'">
    <div :style="headerStyle">
      <p :style="siteNameStyle">
        {{ siteName }}
      </p>
      <p v-if="category" :style="categoryStyle">
        {{ category }}
      </p>
    </div>

    <div>
      <h1 :style="titleStyle">
        {{ title }}
      </h1>
      <p v-if="displayDescription" :style="descriptionStyle">
        {{ displayDescription }}
      </p>
    </div>

    <p :style="taglineStyle">
      {{ tagline }}
    </p>
  </div>
</template>
