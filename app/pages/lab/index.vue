<script setup lang="ts">
const { locale, t } = useI18n()
const contentPrefix = computed(() => `/${locale.value}/lab/`)

const { data: notes } = await useAsyncData(
  `lab:index:${locale.value}`,
  () =>
    queryCollection('lab')
      .where('path', 'LIKE', `${contentPrefix.value}%`)
      .order('date', 'DESC')
      .all(),
  { watch: [locale] }
)

const visibleNotes = computed(() => notes.value?.filter((note) => note.draft !== true) || [])
const latestUpdate = computed(() => visibleNotes.value[0]?.updated || visibleNotes.value[0]?.date)
const activeNotes = computed(
  () =>
    visibleNotes.value.filter((note) =>
      ['active', 'exploring', 'draft'].includes(String(note.status || '').toLowerCase())
    ).length
)

useSeoMeta({
  title: () => t('content.lab.seoTitle'),
  description: () => t('pages.labDescription')
})
</script>

<template>
  <UPage>
    <UPageHeader :title="t('content.lab.title')" :description="t('content.lab.description')">
      <template #headline>
        <UBadge color="neutral" variant="outline">
          {{ t('content.lab.eyebrow') }}
        </UBadge>
      </template>
    </UPageHeader>

    <UPageBody>
      <div class="mb-8 grid gap-4 rounded-2xl border border-default bg-muted/30 p-5 sm:grid-cols-3">
        <div>
          <p class="text-xs font-medium uppercase tracking-widest text-muted">
            {{ t('content.lab.stats.notes') }}
          </p>
          <p class="mt-2 text-2xl font-semibold text-highlighted">
            {{ visibleNotes.length }}
          </p>
        </div>
        <div>
          <p class="text-xs font-medium uppercase tracking-widest text-muted">
            {{ t('content.lab.stats.active') }}
          </p>
          <p class="mt-2 text-2xl font-semibold text-highlighted">
            {{ activeNotes }}
          </p>
        </div>
        <div>
          <p class="text-xs font-medium uppercase tracking-widest text-muted">
            {{ t('content.lab.stats.latest') }}
          </p>
          <ContentMeta class="mt-3" :date="latestUpdate" />
        </div>
      </div>

      <div v-if="visibleNotes.length" class="grid gap-4">
        <ContentListCard
          v-for="note in visibleNotes"
          :key="note.id"
          :title="note.title"
          :description="note.description"
          :to="note.path"
          :date="note.date"
          :updated="note.updated"
          :badge="t('badges.lab')"
          :status="note.status || t('content.lab.defaultStatus')"
          :tags="note.tags"
          :thumbnail="note.thumbnail"
          compact
        />
      </div>
      <EmptyState v-else :title="t('empty.labTitle')" :description="t('empty.labDescription')" />
    </UPageBody>
  </UPage>
</template>
