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
    class="w-full"
    compact
    :plain="plain"
    source="blog_post"
    :title="t('content.subscribe.blog.title')"
    :description="t('content.subscribe.blog.description')"
  />

  <NewsletterSubscribe
    v-else-if="kind === 'lab'"
    class="w-full"
    compact
    :plain="plain"
    source="lab_post"
    :title="t('content.subscribe.lab.title')"
    :description="t('content.subscribe.lab.description')"
  />

  <section v-else class="w-full space-y-3">
    <div class="space-y-1.5">
      <p class="text-ui-xs font-medium tracking-[0.14em] text-highlighted uppercase">
        {{ t('content.subscribe.project.title') }}
      </p>
      <p class="text-ui-sm text-muted">
        {{ t('content.subscribe.project.description') }}
      </p>
    </div>

    <UButton
      :to="localePath('/contact')"
      color="primary"
      variant="soft"
      size="sm"
      icon="i-lucide-mail"
    >
      {{ t('content.subscribe.project.action') }}
    </UButton>
  </section>
</template>
