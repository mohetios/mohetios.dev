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

const rtlLocales = localeDefinitions
  .filter((definition) => definition.dir === 'rtl')
  .map<string>((definition) => definition.code)
const isRtl = computed(() => rtlLocales.includes(props.locale || ''))

const DESCRIPTION_LIMIT = 120
const displayDescription = computed(() => {
  const text = String(props.description || '')
    .replace(/\s+/g, ' ')
    .trim()

  if (text.length <= DESCRIPTION_LIMIT) {
    return text
  }

  const cut = text.slice(0, DESCRIPTION_LIMIT)
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[\s.,،؛:;]+$/, '')}…`
})

const ARABIC_LETTER_RE = /[ء-يٱ-ۓۺ-ۿ]/
const WORD_PUNCTUATION_RE = /^(.*?)([.,!?:;،؛؟…]+)?$/

// Satori has no RTL base direction, so RTL text is split into runs (one per Persian word,
// consecutive Latin words kept together) and laid out by a row-reverse flexbox. Trailing
// punctuation is moved to the front of its run, which Satori draws on the run's left side.
// LTR text stays a single run.
function textRuns(text: string) {
  if (!isRtl.value) {
    return [text]
  }

  const runs: string[] = []
  let previousIsLatin = false

  for (const token of text.split(/\s+/).filter(Boolean)) {
    const [, word = token, punctuation] = token.match(WORD_PUNCTUATION_RE) || []
    const isLatin = !ARABIC_LETTER_RE.test(word)

    if (word && isLatin && previousIsLatin) {
      runs[runs.length - 1] += ` ${word}`
    } else {
      runs.push(word)
    }

    if (punctuation) {
      runs[runs.length - 1] = punctuation + runs[runs.length - 1]
    }

    previousIsLatin = isLatin && !punctuation
  }

  return runs
}

const flowStyle = computed(() => ({
  display: 'flex',
  flexDirection: isRtl.value ? 'row-reverse' : 'row',
  flexWrap: 'wrap',
  columnGap: '0.28em'
}))

const rootStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  width: '100%',
  height: '100%',
  padding: '64px',
  backgroundColor: '#fcfbf8',
  color: '#1a2b22',
  // Literal on purpose: og-image embeds only families it can read statically.
  fontFamily: "'Instrument Sans OG', 'Farhang OG', sans-serif"
}

const headerStyle = computed(() => ({
  display: 'flex',
  flexDirection: isRtl.value ? 'row-reverse' : 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '24px'
}))

const bodyStyle = computed(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: isRtl.value ? 'flex-end' : 'flex-start'
}))

const siteNameStyle = computed(() => ({
  ...flowStyle.value,
  fontSize: '28px',
  letterSpacing: isRtl.value ? '0' : '0.08em',
  color: '#3f6d58',
  margin: 0
}))

const categoryStyle = {
  fontSize: '22px',
  color: '#4d6f5d',
  margin: 0,
  padding: '8px 20px',
  border: '1px solid #d7e4dc',
  borderRadius: '9999px',
  backgroundColor: 'rgba(255, 255, 255, 0.7)'
}

const titleStyle = computed(() => ({
  ...flowStyle.value,
  fontSize: '68px',
  lineHeight: isRtl.value ? 1.4 : 1.08,
  letterSpacing: isRtl.value ? '0' : '-0.03em',
  color: '#102018',
  margin: 0,
  maxWidth: '980px'
}))

const descriptionStyle = computed(() => ({
  ...flowStyle.value,
  fontSize: '30px',
  lineHeight: isRtl.value ? 1.7 : 1.45,
  color: '#4f6358',
  margin: '32px 0 0',
  maxWidth: '900px'
}))

const taglineStyle = computed(() => ({
  ...flowStyle.value,
  fontSize: '24px',
  color: '#6a7f74',
  margin: 0
}))
</script>

<template>
  <div :style="rootStyle">
    <div :style="headerStyle">
      <p class="font-medium" :style="siteNameStyle">
        <span v-for="(run, index) in textRuns(siteName)" :key="index">{{ run }}</span>
      </p>
      <p v-if="category" :style="categoryStyle">
        {{ category }}
      </p>
    </div>

    <div :style="bodyStyle">
      <h1 class="font-semibold" :style="titleStyle">
        <span v-for="(run, index) in textRuns(title)" :key="index">{{ run }}</span>
      </h1>
      <p v-if="displayDescription" :style="descriptionStyle">
        <span v-for="(run, index) in textRuns(displayDescription)" :key="index">{{ run }}</span>
      </p>
    </div>

    <p :style="taglineStyle">
      <span v-for="(run, index) in textRuns(tagline)" :key="index">{{ run }}</span>
    </p>
  </div>
</template>
