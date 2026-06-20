import type { MermaidConfig } from 'mermaid'

const DIAGRAM_FALLBACK_WIDTH = 640

function cssVar(name: string, fallback: string) {
  if (import.meta.server) {
    return fallback
  }

  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || fallback
}

function getFontFamily() {
  if (import.meta.server) {
    return 'Inter, ui-sans-serif, system-ui, sans-serif'
  }

  return getComputedStyle(document.body).fontFamily || cssVar('--font-sans', 'Inter, sans-serif')
}

export function isDarkMermaidTheme() {
  if (import.meta.server) {
    return false
  }

  const root = document.documentElement

  return (
    root.classList.contains('dark') ||
    root.getAttribute('data-theme') === 'dark' ||
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )
}

function getThemeColors() {
  const dark = isDarkMermaidTheme()

  return {
    text: cssVar('--color-text', dark ? '#f6f1e8' : '#17223b'),
    muted: cssVar('--color-muted', dark ? '#c8b89e' : '#927b5e'),
    primary: cssVar('--color-primary', dark ? '#a7c3df' : '#4e6e94'),
    accent: cssVar('--color-accent', dark ? '#aebf9f' : '#596753')
  }
}

function getProseWidth(container: HTMLElement) {
  const prose = container.closest('.prose')
  return prose?.clientWidth ?? DIAGRAM_FALLBACK_WIDTH
}

/** Fit diagram to content width, center it, avoid stretching small charts full-bleed. */
export function normalizeMermaidDiagram(container: HTMLElement) {
  const svg = container.querySelector('svg')
  if (!svg) {
    return
  }

  const viewBox = svg.getAttribute('viewBox')
  if (!viewBox) {
    return
  }

  const parts = viewBox.split(/\s+/).map(Number)
  const vbWidth = parts[2]
  const vbHeight = parts[3]

  if (!vbWidth || !vbHeight) {
    return
  }

  const proseWidth = getProseWidth(container)
  // Small diagrams: natural size. Large diagrams: shrink to prose column only.
  const displayWidth = vbWidth > proseWidth ? proseWidth : vbWidth
  const displayHeight = (vbHeight / vbWidth) * displayWidth

  svg.style.display = 'block'
  svg.style.width = `${displayWidth}px`
  svg.style.height = `${displayHeight}px`
  svg.style.maxWidth = '100%'
  svg.style.marginInline = 'auto'

  container.style.display = 'flex'
  container.style.justifyContent = 'center'
  container.style.alignItems = 'center'
}

export function normalizeMermaidDiagrams(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>('.prose .mohetios-mermaid').forEach((container) => {
    if (container.querySelector('svg')) {
      normalizeMermaidDiagram(container)
    }
  })
}

const MERMAID_THEME_CSS = `
  svg {
    background: transparent !important;
  }

  .root,
  .flowchart,
  .label-container,
  .cluster-label {
    background: transparent !important;
  }

  .cluster rect {
    fill: transparent !important;
    stroke: var(--color-primary) !important;
    stroke-opacity: 0.22 !important;
    stroke-width: 1px !important;
    rx: 10px !important;
    ry: 10px !important;
  }

  .node rect,
  .node circle,
  .node ellipse,
  .node polygon,
  .node path {
    fill: transparent !important;
    stroke: var(--color-accent) !important;
    stroke-width: 1.5px !important;
    filter: none !important;
  }

  .node .label,
  .nodeLabel,
  .label text,
  .node text,
  .edgeLabel,
  .edgeLabel text,
  .cluster-label .nodeLabel {
    fill: var(--color-text) !important;
    color: var(--color-text) !important;
    font-family: inherit !important;
    font-size: 16px !important;
    font-weight: 500 !important;
    letter-spacing: -0.01em !important;
    -webkit-font-smoothing: antialiased !important;
    text-rendering: geometricPrecision !important;
  }

  .edgeLabel {
    background: transparent !important;
  }

  .edgeLabel rect {
    fill: transparent !important;
    stroke: none !important;
  }
`

export function getMermaidConfig(): MermaidConfig {
  const colors = getThemeColors()

  return {
    startOnLoad: false,
    securityLevel: 'strict',
    look: 'classic',
    theme: 'base',
    fontFamily: getFontFamily(),
    fontSize: 16,
    flowchart: {
      curve: 'basis',
      padding: 20,
      htmlLabels: false,
      useMaxWidth: false,
      nodeSpacing: 48,
      rankSpacing: 56,
      wrappingWidth: 220
    },
    themeVariables: {
      darkMode: isDarkMermaidTheme(),
      background: 'transparent',
      mainBkg: 'transparent',
      secondBkg: 'transparent',
      tertiaryBkg: 'transparent',
      primaryColor: 'transparent',
      secondaryColor: 'transparent',
      tertiaryColor: 'transparent',
      primaryTextColor: colors.text,
      secondaryTextColor: colors.text,
      tertiaryTextColor: colors.text,
      textColor: colors.text,
      primaryBorderColor: colors.accent,
      secondaryBorderColor: colors.accent,
      tertiaryBorderColor: colors.accent,
      lineColor: colors.muted,
      arrowheadColor: colors.muted,
      edgeLabelBackground: 'transparent',
      clusterBkg: 'transparent',
      clusterBorder: colors.primary,
      titleColor: colors.text,
      nodeBorder: colors.accent,
      defaultLinkColor: colors.muted
    },
    themeCSS: MERMAID_THEME_CSS
  }
}

export function resetMermaidNodes(nodes: Iterable<HTMLElement>) {
  for (const node of nodes) {
    node.removeAttribute('data-processed')
    const source = node.getAttribute('data-diagram') || node.textContent || ''
    node.textContent = source
    node.style.display = ''
    node.style.justifyContent = ''
    node.style.alignItems = ''
  }
}

export async function renderMermaidDiagrams(root: ParentNode = document) {
  const nodes = root.querySelectorAll<HTMLElement>('.prose .mohetios-mermaid')

  if (!nodes.length) {
    return
  }

  const { default: mermaid } = await import('mermaid')

  mermaid.initialize(getMermaidConfig())
  await mermaid.run({ nodes })

  nodes.forEach((container) => {
    normalizeMermaidDiagram(container)
  })
}
