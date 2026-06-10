<script setup lang="ts">
import {
  normalizeMermaidDiagrams,
  renderMermaidDiagrams,
  resetMermaidNodes
} from '~/utils/mermaid'

const route = useRoute()

let mediaQuery: MediaQueryList | null = null
let themeObserver: MutationObserver | null = null
let resizeObserver: ResizeObserver | null = null

function observeProseColumns() {
  resizeObserver?.disconnect()
  resizeObserver = new ResizeObserver(() => {
    normalizeMermaidDiagrams()
  })

  document.querySelectorAll<HTMLElement>('.prose-mohetios').forEach((prose) => {
    resizeObserver?.observe(prose)
  })
}

async function enhance() {
  await nextTick()

  const nodes = document.querySelectorAll<HTMLElement>('.prose-mohetios .mohetios-mermaid')

  if (!nodes.length) {
    return
  }

  resetMermaidNodes(nodes)

  try {
    await renderMermaidDiagrams()
    observeProseColumns()
  } catch (error) {
    console.error('Mermaid render failed:', error)
  }
}

function onThemeOrColorSchemeChange() {
  void enhance()
}

onMounted(() => {
  void enhance()

  mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', onThemeOrColorSchemeChange)

  themeObserver = new MutationObserver(onThemeOrColorSchemeChange)
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class', 'data-theme']
  })
})

watch(
  () => route.fullPath,
  () => {
    void enhance()
  }
)

onBeforeUnmount(() => {
  mediaQuery?.removeEventListener('change', onThemeOrColorSchemeChange)
  themeObserver?.disconnect()
  resizeObserver?.disconnect()
})
</script>

<template>
  <span class="sr-only" aria-hidden="true" />
</template>
