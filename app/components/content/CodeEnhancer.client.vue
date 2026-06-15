<script setup lang="ts">
const route = useRoute()
const { t } = useI18n()

type Cleanup = () => void

const cleanups: Cleanup[] = []

function getCodeText(pre: HTMLElement) {
  const code = pre.querySelector('code')

  return code?.textContent || ''
}

function enhance() {
  const blocks = document.querySelectorAll<HTMLElement>('.prose pre.shiki')

  blocks.forEach((pre) => {
    if (pre.dataset.mohetiosCodeEnhanced === 'true') {
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
      'bg-default/80',
      'px-2.5',
      'py-1',
      'text-sm',
      'font-medium',
      'text-muted',
      'backdrop-blur',
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

async function runEnhance() {
  await nextTick()
  enhance()
}

onMounted(() => {
  void runEnhance()
})

watch(
  () => route.fullPath,
  () => {
    cleanups.splice(0).forEach((cleanup) => cleanup())
    void runEnhance()
  }
)

onBeforeUnmount(() => {
  cleanups.splice(0).forEach((cleanup) => cleanup())
})
</script>

<template>
  <span class="sr-only" aria-hidden="true" />
</template>
