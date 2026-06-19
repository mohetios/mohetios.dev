<script setup lang="ts">
const route = useRoute()
const { locale, t } = useI18n()
const localePath = useLocalePath()

const slug = computed(() => (route.params.slug as string[]).join('/'))
const path = computed(() => `/${locale.value}/lab/${slug.value}`)
const item = computed(() => getLabNote(path.value))
const collection = computed(() => getLabNotes(locale.value))

if (!item.value || item.value.draft) {
  throw createError({ statusCode: 404, statusMessage: 'Lab note not found', fatal: true })
}
</script>

<template>
  <ContentPageView
    v-if="item"
    kind="lab"
    :item="item"
    :collection="collection"
    :path="path"
    :back-to="localePath('/lab')"
    :back-label="t('content.actions.backToLab')"
    comments-target-type="LAB_NOTE"
  />
</template>
