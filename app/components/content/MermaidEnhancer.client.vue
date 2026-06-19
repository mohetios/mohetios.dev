<script setup lang="ts">
/* eslint-disable vue/no-v-html */
const route = useRoute()
const { t } = useI18n()

let mediaQuery: MediaQueryList | null = null
let themeObserver: MutationObserver | null = null
let resizeObserver: ResizeObserver | null = null

type Cleanup = () => void

const cleanups: Cleanup[] = []
const ZOOM_MAX = 2.5
const ZOOM_MIN = 0.75
const ZOOM_STEP = 0.25
const SVG_NAMESPACE = 'http://www.w3.org/2000/svg'
const MERMAID_ICONS = {
  externalLink:
    '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 3h6v6m-11 5L21 3m-3 10v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  fullscreen:
    '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 3h6v6m0-6l-7 7M3 21l7-7m-1 7H3v-6"/>',
  reset:
    '<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9a9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></g>',
  zoomIn:
    '<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21l-4.35-4.35M11 8v6m-3-3h6"/></g>',
  zoomOut:
    '<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21l-4.35-4.35M8 11h6"/></g>'
} as const

type MermaidIcon = keyof typeof MERMAID_ICONS

const viewerOpen = ref(false)
const viewerSvg = ref('')
const viewerZoom = ref(1)
const viewerPan = ref({ x: 0, y: 0 })
const viewerViewport = ref<HTMLElement | null>(null)
const isViewerDragging = ref(false)
const viewerBaseSize = ref({ height: 0, width: 0 })

let viewerStart = { panX: 0, panY: 0, pointerX: 0, pointerY: 0 }

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

async function loadMermaidUtils() {
  return import('~/utils/mermaid')
}

function observeProseColumns(normalizeMermaidDiagrams: () => void) {
  resizeObserver?.disconnect()
  resizeObserver = new ResizeObserver(() => {
    normalizeMermaidDiagrams()
  })

  document.querySelectorAll<HTMLElement>('.prose').forEach((prose) => {
    resizeObserver?.observe(prose)
  })
}

function createButton(label: string, icon: MermaidIcon, onClick: () => void, extraClass?: string) {
  const button = document.createElement('button')
  button.type = 'button'
  button.className = [
    'mermaid-action-button',
    'rounded-md',
    'border',
    'border-default',
    'bg-elevated',
    'inline-flex',
    'size-8',
    'items-center',
    'justify-center',
    'py-1',
    'text-sm',
    'font-medium',
    'text-muted',
    'transition',
    'hover:text-highlighted',
    extraClass || ''
  ].join(' ')
  button.setAttribute('aria-label', label)
  button.title = label

  const iconNode = document.createElementNS(SVG_NAMESPACE, 'svg')
  iconNode.setAttribute('viewBox', '0 0 24 24')
  iconNode.setAttribute('fill', 'none')
  iconNode.innerHTML = MERMAID_ICONS[icon]
  iconNode.setAttribute('aria-hidden', 'true')
  button.appendChild(iconNode)

  button.addEventListener('click', onClick)

  cleanups.push(() => {
    button.removeEventListener('click', onClick)
    button.remove()
  })

  return button
}

function getSvg(container: HTMLElement) {
  return container.querySelector<SVGSVGElement>('svg')
}

function getSvgSize(svg: SVGSVGElement) {
  const width = Number.parseFloat(svg.style.width || svg.getAttribute('width') || '')
  const height = Number.parseFloat(svg.style.height || svg.getAttribute('height') || '')

  if (width > 0 && height > 0) {
    return { height, width }
  }

  const viewBox = svg.viewBox.baseVal

  if (viewBox.width > 0 && viewBox.height > 0) {
    return { height: viewBox.height, width: viewBox.width }
  }

  const rect = svg.getBoundingClientRect()

  if (rect.width > 0 && rect.height > 0) {
    return { height: rect.height, width: rect.width }
  }

  return { height: 0, width: 0 }
}

function getContainerCenter(container: HTMLElement) {
  const rect = container.getBoundingClientRect()

  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2
  }
}

function getViewerCenter() {
  const viewport = viewerViewport.value

  if (!viewport) {
    return undefined
  }

  return getContainerCenter(viewport)
}

function openSvgInNewTab(container: HTMLElement) {
  const svg = getSvg(container)
  if (!svg) {
    return
  }

  const source = new XMLSerializer().serializeToString(svg)
  const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  window.open(url, '_blank', 'noopener,noreferrer')
  window.setTimeout(() => URL.revokeObjectURL(url), 30000)
}

function getViewerPoint(point: { x: number; y: number }) {
  const viewport = viewerViewport.value

  if (!viewport) {
    return null
  }

  const rect = viewport.getBoundingClientRect()

  return {
    x: point.x - rect.left,
    y: point.y - rect.top
  }
}

function applyViewerZoom(zoom: number, focalPoint?: { x: number; y: number }) {
  const viewportPoint = focalPoint ? getViewerPoint(focalPoint) : null
  const nextZoom = clamp(zoom, ZOOM_MIN, ZOOM_MAX)

  if (!viewportPoint) {
    viewerZoom.value = nextZoom
    return
  }

  const worldX = (viewportPoint.x - viewerPan.value.x) / viewerZoom.value
  const worldY = (viewportPoint.y - viewerPan.value.y) / viewerZoom.value

  viewerZoom.value = nextZoom
  viewerPan.value = {
    x: viewportPoint.x - worldX * nextZoom,
    y: viewportPoint.y - worldY * nextZoom
  }
}

function resetViewer() {
  const viewport = viewerViewport.value
  viewerZoom.value = 1

  if (!viewport) {
    viewerPan.value = { x: 0, y: 0 }
    return
  }

  viewerPan.value = {
    x: viewport.clientWidth * 0.12,
    y: viewport.clientHeight * 0.18
  }
}

function openViewer(container: HTMLElement) {
  const svg = getSvg(container)

  if (!svg) {
    return
  }

  viewerBaseSize.value = getSvgSize(svg)
  viewerSvg.value = new XMLSerializer().serializeToString(svg)
  viewerOpen.value = true

  void nextTick(() => {
    resetViewer()
  })
}

function onViewerWheel(event: WheelEvent) {
  event.preventDefault()
  const direction = event.deltaY > 0 ? -1 : 1
  const step = event.shiftKey ? ZOOM_STEP / 2 : ZOOM_STEP
  applyViewerZoom(viewerZoom.value + direction * step, {
    x: event.clientX,
    y: event.clientY
  })
}

function onViewerPointerDown(event: PointerEvent) {
  if ((event.target as HTMLElement).closest('.mermaid-viewer-toolbar')) {
    return
  }

  isViewerDragging.value = true
  viewerStart = {
    panX: viewerPan.value.x,
    panY: viewerPan.value.y,
    pointerX: event.clientX,
    pointerY: event.clientY
  }
  viewerViewport.value?.setPointerCapture(event.pointerId)
}

function onViewerPointerMove(event: PointerEvent) {
  if (!isViewerDragging.value) {
    return
  }

  viewerPan.value = {
    x: viewerStart.panX + event.clientX - viewerStart.pointerX,
    y: viewerStart.panY + event.clientY - viewerStart.pointerY
  }
}

function stopViewerDragging(event: PointerEvent) {
  if (!isViewerDragging.value) {
    return
  }

  isViewerDragging.value = false

  if (viewerViewport.value?.hasPointerCapture(event.pointerId)) {
    viewerViewport.value.releasePointerCapture(event.pointerId)
  }
}

function enhanceControls() {
  document.querySelectorAll<HTMLElement>('.prose .mohetios-mermaid').forEach((container) => {
    if (container.dataset.mohetiosMermaidControls === 'true' || !container.querySelector('svg')) {
      return
    }

    container.dataset.mohetiosMermaidControls = 'true'

    const toolbar = document.createElement('div')
    toolbar.className = 'mermaid-action-toolbar'

    toolbar.appendChild(
      createButton(
        t('content.mermaid.fullscreen'),
        'fullscreen',
        () => {
          openViewer(container)
        },
        'mermaid-action-primary'
      )
    )
    toolbar.appendChild(
      createButton(
        t('content.mermaid.openSvg'),
        'externalLink',
        () => {
          openSvgInNewTab(container)
        },
        'mermaid-action-secondary'
      )
    )

    container.appendChild(toolbar)

    cleanups.push(() => {
      toolbar.remove()
      delete container.dataset.mohetiosMermaidControls
    })
  })
}

async function enhance() {
  await nextTick()

  const nodes = document.querySelectorAll<HTMLElement>('.prose .mohetios-mermaid')

  if (!nodes.length) {
    return
  }

  const { normalizeMermaidDiagrams, renderMermaidDiagrams, resetMermaidNodes } =
    await loadMermaidUtils()

  cleanups.splice(0).forEach((cleanup) => cleanup())
  resetMermaidNodes(nodes)

  try {
    await renderMermaidDiagrams()
    observeProseColumns(normalizeMermaidDiagrams)
    enhanceControls()
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
  cleanups.splice(0).forEach((cleanup) => cleanup())
  mediaQuery?.removeEventListener('change', onThemeOrColorSchemeChange)
  themeObserver?.disconnect()
  resizeObserver?.disconnect()
})
</script>

<template>
  <span class="sr-only" aria-hidden="true" />
  <UModal
    v-model:open="viewerOpen"
    :ui="{
      content: 'h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-none overflow-hidden p-0'
    }"
  >
    <template #content>
      <div class="flex h-full flex-col bg-default">
        <div
          class="mermaid-viewer-toolbar z-10 flex items-center justify-between gap-3 border-b border-default px-3 py-2"
        >
          <div class="flex items-center gap-1">
            <UButton
              color="neutral"
              variant="ghost"
              size="sm"
              icon="i-lucide-zoom-out"
              :aria-label="t('content.mermaid.zoomOut')"
              @click="applyViewerZoom(viewerZoom - ZOOM_STEP, getViewerCenter())"
            />
            <UButton
              color="neutral"
              variant="ghost"
              size="sm"
              icon="i-lucide-zoom-in"
              :aria-label="t('content.mermaid.zoomIn')"
              @click="applyViewerZoom(viewerZoom + ZOOM_STEP, getViewerCenter())"
            />
            <UButton
              color="neutral"
              variant="ghost"
              size="sm"
              icon="i-lucide-rotate-ccw"
              :aria-label="t('content.mermaid.reset')"
              @click="resetViewer"
            />
          </div>

          <UButton
            color="neutral"
            variant="ghost"
            size="sm"
            icon="i-lucide-x"
            :aria-label="t('content.mermaid.close')"
            @click="viewerOpen = false"
          />
        </div>

        <div
          ref="viewerViewport"
          class="relative min-h-0 flex-1 cursor-grab overflow-hidden bg-muted/20 touch-none select-none data-[dragging=true]:cursor-grabbing"
          :data-dragging="isViewerDragging"
          @wheel="onViewerWheel"
          @pointerdown="onViewerPointerDown"
          @pointermove="onViewerPointerMove"
          @pointerup="stopViewerDragging"
          @pointercancel="stopViewerDragging"
        >
          <div
            class="mermaid-viewer-stage absolute left-0 top-0 p-24"
            :style="{
              width: `${viewerBaseSize.width * viewerZoom}px`,
              height: `${viewerBaseSize.height * viewerZoom}px`,
              transform: `translate(${viewerPan.x}px, ${viewerPan.y}px)`
            }"
            v-html="viewerSvg"
          />
        </div>
      </div>
    </template>
  </UModal>
</template>
