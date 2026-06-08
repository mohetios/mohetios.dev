<script setup lang="ts">
defineProps<{
  kind: 'blog' | 'lab' | 'project'
  size: 'compact' | 'large'
}>()

const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <NewsletterSubscribe
    v-if="kind === 'blog'"
    :compact="size === 'compact'"
    source="blog_post"
    :title="t('content.subscribe.blog.title')"
    :description="t('content.subscribe.blog.description')"
  />

  <NewsletterSubscribe
    v-else-if="kind === 'lab'"
    :compact="size === 'compact'"
    source="lab_post"
    :title="t('content.subscribe.lab.title')"
    :description="t('content.subscribe.lab.description')"
  />

  <UCard
    v-else
    :variant="size === 'compact' ? 'subtle' : 'outline'"
    :class="size === 'large' ? 'p-1' : ''"
  >
    <div :class="size === 'large' ? 'space-y-4 p-4 sm:p-6' : 'space-y-3'">
      <div>
        <p
          :class="
            size === 'large'
              ? 'text-ui-lg font-semibold tracking-tight text-highlighted'
              : 'text-ui-sm font-medium text-highlighted'
          "
        >
          {{ t('content.subscribe.project.title') }}
        </p>
        <p class="mt-2 text-ui-sm leading-6 text-muted">
          {{ t('content.subscribe.project.description') }}
        </p>
      </div>

      <UButton :to="localePath('/contact')" color="primary" variant="soft" icon="i-lucide-mail">
        {{ t('content.subscribe.project.action') }}
      </UButton>
    </div>
  </UCard>
</template>
