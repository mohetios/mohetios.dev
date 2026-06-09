<script setup lang="ts">
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

useMohetSeo({
  title: () => `${note.value?.title} · ${t('badges.lab')} · Mohetios.dev`,
  description: note.value.description,
  path: () => note.value?.path,
  image: () => note.value?.thumbnail,
  type: 'article',
  publishedTime: () => note.value?.date,
  modifiedTime: () => note.value?.updated
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

    <ContentHero :title="note.title" :description="note.description" :thumbnail="note.thumbnail" />

    <ContentShell
      kind="lab"
      :content="note.content"
      :toc-links="tocLinks"
      :show-toc="showToc"
      :surround="surround"
      :back-to="localePath('/lab')"
      :back-label="t('content.actions.backToLab')"
    >
      <template #notice>
        <div class="mb-8 rounded-xl bg-muted/25 px-5 py-4 sm:px-6 sm:py-5">
          <p class="text-ui-sm leading-6 text-muted">
            {{ t('content.lab.workingNote') }}
          </p>
        </div>
      </template>
    </ContentShell>
  </UPage>
</template>
