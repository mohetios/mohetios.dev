<script setup lang="ts">
type SurroundItem = {
  title: string
  path: string
  description?: string
} | null

type RelatedPost = {
  id?: string
  path: string
  title: string
  description?: string
  date?: string
  updated?: string
}

const props = defineProps<{
  surround?: SurroundItem[]
  relatedPosts?: RelatedPost[]
}>()

const { t } = useI18n()

const hasSurround = computed(() => props.surround?.some(Boolean) ?? false)
const hasRelated = computed(() => Boolean(props.relatedPosts?.length))
</script>

<template>
  <footer class="mohetios-site-column min-w-0">
    <div class="space-y-10">
      <section v-if="hasSurround" class="space-y-4">
        <p class="mohetios-article-section-label">
          {{ t('content.article.continueReading') }}
        </p>
        <ContentSurround :surround="surround || []" />
      </section>

      <section v-if="hasRelated" class="space-y-4">
        <p class="mohetios-article-section-label">
          {{ t('content.article.relatedPosts') }}
        </p>
        <div class="mohetios-content-footer-list">
          <ContentList
            v-for="related in relatedPosts"
            :key="related.id || related.path"
            plain
            :title="related.title"
            :description="related.description"
            :to="related.path"
            :date="related.date"
            :updated="related.updated"
          />
        </div>
      </section>

      <section>
        <ContentSubscribe kind="blog" plain />
      </section>
    </div>
  </footer>
</template>
