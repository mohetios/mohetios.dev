<script setup lang="ts">
const { t } = useI18n()

const copied = ref(false)
const canShare = ref(false)

onMounted(() => {
  canShare.value = typeof navigator !== 'undefined' && typeof navigator.share === 'function'
})

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

async function sharePage() {
  if (!canShare.value || typeof window === 'undefined') {
    return
  }

  try {
    await navigator.share({
      url: window.location.href,
      title: document.title
    })
  } catch {
    // User cancelled or share failed — no-op.
  }
}
</script>

<template>
  <UCard variant="subtle">
    <div class="space-y-3">
      <p class="text-ui-xs font-medium uppercase tracking-widest text-muted">
        {{ t('content.share.title') }}
      </p>

      <div class="flex flex-wrap gap-2">
        <UButton color="neutral" variant="soft" size="sm" icon="i-lucide-link" @click="copyLink">
          {{ copied ? t('content.share.copied') : t('content.share.copyLink') }}
        </UButton>

        <UButton
          v-if="canShare"
          color="neutral"
          variant="soft"
          size="sm"
          icon="i-lucide-share-2"
          @click="sharePage"
        >
          {{ t('content.share.native') }}
        </UButton>
      </div>
    </div>
  </UCard>
</template>
