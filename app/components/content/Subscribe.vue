<script setup lang="ts">
defineProps<{
  kind: 'blog' | 'lab' | 'project'
  plain?: boolean
}>()

const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <NewsletterSubscribe
    v-if="kind === 'blog'"
    compact
    :plain="plain"
    source="blog_post"
    :title="t('content.subscribe.blog.title')"
    :description="t('content.subscribe.blog.description')"
  />

  <NewsletterSubscribe
    v-else-if="kind === 'lab'"
    compact
    :plain="plain"
    source="lab_post"
    :title="t('content.subscribe.lab.title')"
    :description="t('content.subscribe.lab.description')"
  />

  <UCard v-else variant="subtle">
    <div class="space-y-3">
      <div>
        <p class="text-ui-sm font-medium text-highlighted">
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
