<script setup lang="ts">
import { estimateReadingTimeFromHtml } from '~/utils/content-reading-time'

const route = useRoute()
const { locale, t } = useI18n()
const localePath = useLocalePath()
const slug = computed(() => (route.params.slug as string[]).join('/'))
const path = computed(() => `/${locale.value}/lab/${slug.value}`)
const note = computed(() => getLabNote(path.value))

if (!note.value || note.value.draft) {
  throw createError({ statusCode: 404, statusMessage: 'Lab note not found', fatal: true })
}

const notes = computed(() => getLabNotes(locale.value))
const tocLinks = computed(() => getTocNavLinks(note.value?.tocData))
const showToc = computed(() => shouldShowToc(note.value?.tocData))
const surround = computed(() => getSurround(notes.value, path.value))

const readingTime = computed(() => {
  if (note.value?.readingTime) {
    return note.value.readingTime
  }

  const minutes = estimateReadingTimeFromHtml(note.value?.content)
  return t('content.meta.readingTimeValue', { count: minutes })
})

const articleStatus = computed(() => note.value?.category || note.value?.status || t('badges.lab'))

const { canonicalUrl: shareUrl } = useContentSeo({
  title: () => note.value?.title,
  description: () => note.value?.description,
  path: () => toPublicPath(note.value?.path || path.value),
  image: () => note.value?.thumbnail,
  locale: () => locale.value,
  publishedAt: () => note.value?.date,
  updatedAt: () => note.value?.updated,
  tags: () => note.value?.tags || [],
  category: () => note.value?.category || note.value?.status || t('badges.lab')
})
</script>

<template>
  <UPage v-if="note">
    <ContentArticleJsonLd
      kind="lab"
      :title="note.title"
      :description="note.description"
      :path="note.path"
      :image="note.thumbnail"
      :date="note.date"
      :updated="note.updated"
    />

    <ContentArticleHeader
      :title="note.title"
      :description="note.description"
      :thumbnail="note.thumbnail"
      :thumbnail-alt="note.thumbnailAlt || note.title"
      :thumbnail-credit="note.thumbnailCredit"
      :date="note.date"
      :updated="note.updated"
      :author="note.author || 'Ali Zemani'"
      :reading-time="readingTime"
      :status="articleStatus"
      :tags="note.tags"
      :back-to="localePath('/lab')"
      :back-label="t('content.actions.backToLab')"
    />

    <ContentShell
      kind="lab"
      :content="note.content"
      :toc-links="tocLinks"
      :show-toc="showToc"
      :surround="surround"
    >
      <template #notice>
        <p
          class="rounded-xl border border-default bg-muted/30 px-4 py-3 text-base leading-7 text-muted"
        >
          {{ t('content.lab.workingNote') }}
        </p>
      </template>

      <template #share>
        <ContentSocialShare
          :title="note.title"
          :description="note.description"
          :url="shareUrl"
        />
      </template>

      <template #comments>
        <ContentComments
          target-type="LAB_NOTE"
          :target-path="path"
          :target-title="note.title"
        />
      </template>
    </ContentShell>
  </UPage>
</template>
