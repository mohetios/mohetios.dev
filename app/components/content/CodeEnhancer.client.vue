<script setup lang="ts">
import { detectTextDirection } from '~~/shared/utils/text-direction'

const route = useRoute()
const { t } = useI18n()

type Cleanup = () => void

const cleanups: Cleanup[] = []
let proseObserver: MutationObserver | null = null

function getCodeText(pre: HTMLElement) {
  const code = pre.querySelector('code')

  return code?.textContent || ''
}

function setCodeDirection(pre: HTMLElement) {
  const code = pre.querySelector<HTMLElement>('code')
  const direction = detectTextDirection(getCodeText(pre))

  pre.dir = direction

  if (code) {
    code.dir = direction
  }
}

function enhanceTables() {
  const tables = document.querySelectorAll<HTMLTableElement>('.prose table')

  tables.forEach((table) => {
    if (table.closest('.mohetios-table-scroll')) {
      return
    }

    const wrapper = document.createElement('div')
    wrapper.className = 'mohetios-table-scroll'

    table.parentNode?.insertBefore(wrapper, table)
    wrapper.appendChild(table)
  })
}

function enhance() {
  const blocks = document.querySelectorAll<HTMLElement>('.prose pre')

  enhanceTables()

  blocks.forEach((pre) => {
    setCodeDirection(pre)

    if (pre.dataset.mohetiosCodeEnhanced === 'true') {
      return
    }

    if (!pre.classList.contains('shiki')) {
      return
    }

    pre.dataset.mohetiosCodeEnhanced = 'true'

    const button = document.createElement('button')
    button.type = 'button'
    button.className = [
      'code-copy-button',
      'rounded-md',
      'border',
      'border-default',
      'bg-elevated',
      'px-2.5',
      'py-1',
      'text-sm',
      'font-medium',
      'text-muted',
      'transition',
      'hover:text-highlighted'
    ].join(' ')
    button.textContent = t('content.code.copy')
    button.setAttribute('aria-label', t('content.code.copy'))

    const onClick = async () => {
      try {
        await navigator.clipboard.writeText(getCodeText(pre))
        button.textContent = t('content.code.copied')
        window.setTimeout(() => {
          button.textContent = t('content.code.copy')
        }, 1400)
      } catch {
        button.textContent = t('content.code.copyFailed')
        window.setTimeout(() => {
          button.textContent = t('content.code.copy')
        }, 1400)
      }
    }

    button.addEventListener('click', onClick)
    pre.appendChild(button)

    cleanups.push(() => {
      button.removeEventListener('click', onClick)
      button.remove()
      delete pre.dataset.mohetiosCodeEnhanced
    })
  })
}

function observeProse() {
  proseObserver?.disconnect()

  proseObserver = new MutationObserver(() => {
    enhance()
  })

  document.querySelectorAll<HTMLElement>('.prose').forEach((prose) => {
    proseObserver?.observe(prose, {
      childList: true,
      subtree: true
    })
  })
}

async function runEnhance() {
  await nextTick()
  enhance()
}

onMounted(() => {
  void runEnhance()
  observeProse()
})

watch(
  () => route.fullPath,
  () => {
    cleanups.splice(0).forEach((cleanup) => cleanup())
    void runEnhance()
    observeProse()
  }
)

onBeforeUnmount(() => {
  cleanups.splice(0).forEach((cleanup) => cleanup())
  proseObserver?.disconnect()
})
</script>

<template>
  <span class="sr-only" aria-hidden="true" />
</template>
