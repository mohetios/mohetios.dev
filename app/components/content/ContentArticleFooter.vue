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
const hasPostReading = computed(() => hasSurround.value || hasRelated.value)
</script>

<template>
  <footer class="border-t border-default bg-default">
    <div class="mohetios-editorial-column space-y-6 py-8">
      <ContentShareActions flat />

      <section
        v-if="hasPostReading"
        class="space-y-4 border-t border-default pt-6"
        :aria-label="t('content.article.continueReading')"
      >
        <ContentSurround v-if="hasSurround" :surround="surround || []" />

        <div v-if="hasRelated" :class="{ 'border-t border-default pt-4': hasSurround }">
          <p class="mohetios-article-section-label mb-3">
            {{ t('content.article.relatedPosts') }}
          </p>
          <div class="grid gap-3 sm:grid-cols-2">
            <ContentListCard
              v-for="related in relatedPosts"
              :key="related.id || related.path"
              :title="related.title"
              :description="related.description"
              :to="related.path"
              :date="related.date"
              :updated="related.updated"
              :badge="t('badges.blog')"
              compact
            />
          </div>
        </div>
      </section>

      <section class="border-t border-default pt-6">
        <ContentSubscribeCard size="compact" kind="blog" />
      </section>
    </div>
  </footer>
</template>
