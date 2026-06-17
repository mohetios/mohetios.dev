<script setup lang="ts">
const { locale, t } = useI18n()
const visibleNotes = computed(() => getLabNotes(locale.value))
const latestUpdate = computed(() => visibleNotes.value[0]?.updated || visibleNotes.value[0]?.date)
const activeNotes = computed(
  () =>
    visibleNotes.value.filter((note) =>
      ['active', 'exploring', 'draft'].includes(String(note.status || '').toLowerCase())
    ).length
)

useMohetiosSeo({
  title: () => t('content.lab.title'),
  description: () => t('pages.labDescription'),
  path: () => getLocalizedPublicPath('/lab', locale.value),
  locale: () => locale.value,
  type: 'website'
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
        <div class="space-y-2">
          <p
            class="text-sm font-medium tracking-[0.14em] text-muted uppercase rtl:normal-case rtl:tracking-normal"
          >
            {{ t('content.lab.stats.notes') }}
          </p>
          <p class="text-3xl font-semibold tracking-tight text-highlighted">
            {{ visibleNotes.length }}
          </p>
        </div>
        <div class="space-y-2">
          <p
            class="text-sm font-medium tracking-[0.14em] text-muted uppercase rtl:normal-case rtl:tracking-normal"
          >
            {{ t('content.lab.stats.active') }}
          </p>
          <p class="text-3xl font-semibold tracking-tight text-highlighted">
            {{ activeNotes }}
          </p>
        </div>
        <div class="space-y-2">
          <p
            class="text-sm font-medium tracking-[0.14em] text-muted uppercase rtl:normal-case rtl:tracking-normal"
          >
            {{ t('content.lab.stats.latest') }}
          </p>
          <ContentMeta class="mt-1" :date="latestUpdate" />
        </div>
      </div>

      <div v-if="visibleNotes.length" class="grid gap-4">
        <ContentList
          v-for="note in visibleNotes"
          :key="note.id"
          :title="note.title"
          :description="note.description"
          :to="toPublicPath(note.path)"
          :date="note.date"
          :updated="note.updated"
          :badge="t('badges.lab')"
          :status="note.status || t('content.lab.defaultStatus')"
          :tags="note.tags"
          :thumbnail="note.thumbnail"
          compact
        />
      </div>
      <UiEmpty v-else :title="t('empty.labTitle')" :description="t('empty.labDescription')" />
    </UPageBody>
  </UPage>
</template>
