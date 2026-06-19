<script setup lang="ts">
const route = useRoute()
const { locale, t } = useI18n()
const localePath = useLocalePath()

const slug = computed(() => (route.params.slug as string[]).join('/'))
const path = computed(() => `/${locale.value}/blog/${slug.value}`)
const item = computed(() => getBlogPost(path.value))
const collection = computed(() => getBlogPosts(locale.value))

if (!item.value || item.value.draft) {
  throw createError({ statusCode: 404, statusMessage: 'Blog post not found', fatal: true })
}
</script>

<template>
  <ContentPageView
    v-if="item"
    kind="blog"
    :item="item"
    :collection="collection"
    :path="path"
    :back-to="localePath('/blog')"
    :back-label="t('content.actions.backToNotebook')"
    comments-target-type="BLOG_POST"
  />
</template>
