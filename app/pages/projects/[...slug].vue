<script setup lang="ts">
const route = useRoute()
const { locale, t } = useI18n()
const localePath = useLocalePath()

const slug = computed(() => (route.params.slug as string[]).join('/'))
const path = computed(() => `/${locale.value}/projects/${slug.value}`)
const item = computed(() => getProject(path.value))
const collection = computed(() => getProjects(locale.value))

if (!item.value || item.value.draft) {
  throw createError({ statusCode: 404, statusMessage: 'System not found', fatal: true })
}
</script>

<template>
  <ContentPageView
    v-if="item"
    kind="project"
    :item="item"
    :collection="collection"
    :path="path"
    :back-to="localePath('/projects')"
    :back-label="t('content.actions.backToSystems')"
    comments-target-type="PROJECT"
  />
</template>
