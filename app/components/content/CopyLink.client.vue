<script setup lang="ts">
const { t } = useI18n()

const copied = ref(false)

async function copyLink() {
  if (typeof window === 'undefined') {
    return
  }

  try {
    await navigator.clipboard.writeText(window.location.href)
    copied.value = true
    window.setTimeout(() => {
      copied.value = false
    }, 1400)
  } catch {
    copied.value = false
  }
}
</script>

<template>
  <UButton color="neutral" variant="soft" size="sm" icon="i-lucide-link" @click="copyLink">
    {{ copied ? t('content.share.copied') : t('content.share.copyLink') }}
  </UButton>
</template>
