<script setup lang="ts">
type SocialNetwork = 'linkedin' | 'x' | 'reddit' | 'telegram' | 'email'

const props = withDefaults(
  defineProps<{
    title: string
    description?: string
    url?: string
    networks?: SocialNetwork[]
  }>(),
  {
    networks: () => ['linkedin', 'x', 'reddit', 'telegram', 'email']
  }
)

const { t } = useI18n()
const copied = ref(false)
let copiedTimer: ReturnType<typeof setTimeout> | undefined

const networkLabels: Record<SocialNetwork, string> = {
  linkedin: 'content.share.linkedin',
  x: 'content.share.x',
  reddit: 'content.share.reddit',
  telegram: 'content.share.telegram',
  email: 'content.share.email'
}

const buttonUi = {
  label: 'text-ui-sm'
}

async function copyLink() {
  if (!props.url || !import.meta.client) {
    return
  }

  try {
    await navigator.clipboard.writeText(props.url)
    copied.value = true

    if (copiedTimer) {
      clearTimeout(copiedTimer)
    }

    copiedTimer = setTimeout(() => {
      copied.value = false
    }, 1500)
  } catch {
    copied.value = false
  }
}

onBeforeUnmount(() => {
  if (copiedTimer) {
    clearTimeout(copiedTimer)
  }
})
</script>

<template>
  <section class="space-y-3">
    <p class="mohetios-article-section-label">
      {{ t('content.share.title') }}
    </p>

    <div class="flex flex-wrap items-center gap-2">
      <SocialShare
        v-for="network in networks"
        :key="network"
        :network="network"
        :title="title"
        :description="description"
        :url="url"
        :styled="false"
        class="inline-flex"
      >
        <UButton color="neutral" variant="soft" size="sm" :ui="buttonUi">
          {{ t(networkLabels[network]) }}
        </UButton>
      </SocialShare>

      <UButton
        v-if="url"
        color="neutral"
        variant="outline"
        size="sm"
        icon="i-lucide-link"
        :ui="buttonUi"
        @click="copyLink"
      >
        {{ copied ? t('content.share.copied') : t('content.share.copyLink') }}
      </UButton>
    </div>
  </section>
</template>
