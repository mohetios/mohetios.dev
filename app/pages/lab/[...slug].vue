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
const tocLinks = computed(() => note.value?.tocData || [])
const showToc = computed(() => tocLinks.value.length > 2)
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
    <UPageHeader :title="note.title" :description="note.description" class="mx-auto max-w-4xl">
      <template #headline>
        <ContentMeta
          :date="note.date"
          :updated="note.updated"
          :status="note.status || t('content.lab.defaultStatus')"
        />
      </template>
      <ContentTagList :tags="note.tags" />
    </UPageHeader>

    <UPageBody>
      <div class="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <article class="min-w-0">
          <div class="mx-auto mb-8 max-w-3xl rounded-2xl border border-default bg-muted/30 p-5">
            <p class="text-sm leading-7 text-muted">
              {{ t('content.lab.workingNote') }}
            </p>
          </div>

          <ContentHtml :html="note.content" class="prose-mohetios mx-auto max-w-3xl" />
        </article>

        <aside class="hidden lg:block">
          <div class="sticky top-24 space-y-5">
            <UCard variant="subtle">
              <div class="space-y-4">
                <div>
                  <p class="text-xs font-medium uppercase tracking-widest text-muted">
                    {{ t('content.meta.status') }}
                  </p>
                  <p class="mt-2 text-sm font-medium text-highlighted">
                    {{ note.status || t('content.lab.defaultStatus') }}
                  </p>
                </div>
                <div>
                  <p class="text-xs font-medium uppercase tracking-widest text-muted">
                    {{ t('content.meta.tags') }}
                  </p>
                  <ContentTagList class="mt-2" :tags="note.tags" />
                </div>
              </div>
            </UCard>

            <ContentToc v-if="showToc" :title="t('content.toc')" :links="tocLinks" highlight />
          </div>
        </aside>
      </div>

      <div class="mx-auto mt-12 max-w-4xl space-y-8">
        <UButton
          :to="localePath('/lab')"
          color="neutral"
          variant="ghost"
          icon="i-lucide-arrow-left"
        >
          {{ t('content.actions.backToLab') }}
        </UButton>

        <ContentSurround v-if="surround.length" :surround="surround" />
      </div>
    </UPageBody>
  </UPage>
</template>
