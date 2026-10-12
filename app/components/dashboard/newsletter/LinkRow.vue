<script setup lang="ts">
export type EditableNewsletterLink = {
  title: string
  url: string
  description: string
  meta: string
}

const link = defineModel<EditableNewsletterLink>({ required: true })

const emit = defineEmits<{
  remove: []
}>()

const { t } = useI18n()
</script>

<template>
  <div class="relative grid gap-2 rounded-xl p-3 pe-12 ring-1 ring-default sm:grid-cols-3">
    <UInput
      v-model="link.title"
      class="sm:col-span-3"
      :placeholder="t('dashboard.newsletter.composer.linkTitle')"
    />
    <UInput
      v-model="link.url"
      class="sm:col-span-3"
      type="url"
      dir="ltr"
      placeholder="https://"
      :aria-label="t('dashboard.newsletter.composer.linkUrl')"
    />
    <UInput
      v-model="link.description"
      class="sm:col-span-2"
      :placeholder="t('dashboard.newsletter.composer.linkDescription')"
    />
    <UInput v-model="link.meta" :placeholder="t('dashboard.newsletter.composer.linkMeta')" />
    <UButton
      class="absolute end-2 top-3"
      color="neutral"
      variant="ghost"
      icon="i-lucide-x"
      :aria-label="t('dashboard.newsletter.composer.removeLink')"
      @click="emit('remove')"
    />
  </div>
</template>
