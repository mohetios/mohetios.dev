<script setup lang="ts">
const { locale, t } = useI18n()
const labNotes = computed(() => getLabNotes(locale.value))
const questions = computed(() => [
  t('pages.labIndex.questions.worthBuilding'),
  t('pages.labIndex.questions.staySmall'),
  t('pages.labIndex.questions.testFirst')
])
useMohetiosSeo({
  title: () => t('pages.labIndex.kicker'),
  description: () => t('pages.labIndex.description'),
  path: () => getLocalizedPublicPath('/lab', locale.value),
  locale: () => locale.value,
  type: 'website'
})

function formatDate(date?: string | Date) {
  if (!date) return ''

  return new Date(date).toLocaleDateString(locale.value, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<template>
  <UPage class="mh-page">
    <UPageBody :ui="{ base: 'space-y-10 pb-16 sm:space-y-12' }">
      <section
        id="lab"
        class="grid gap-8 border-b border-default pb-8 lg:grid-cols-[0.68fr_0.32fr] lg:items-end"
      >
        <div class="max-w-4xl space-y-5">
          <p class="mh-kicker">
            {{ t('pages.labIndex.kicker') }}
          </p>
          <h1
            class="mh-display max-w-4xl text-4xl leading-tight font-semibold text-balance text-highlighted sm:text-5xl lg:text-6xl"
          >
            {{ t('pages.labIndex.title') }}
          </h1>
          <p class="max-w-2xl text-base leading-7 text-pretty text-muted sm:text-lg sm:leading-8">
            {{ t('pages.labIndex.description') }}
          </p>
        </div>

        <div class="hidden border-y border-default py-4 lg:block">
          <p class="mh-kicker">
            {{ t('pages.labIndex.status.title') }}
          </p>
          <p class="mt-2 text-sm leading-6 text-muted">
            {{ t('pages.labIndex.status.description') }}
          </p>
        </div>
      </section>

      <section class="grid gap-4 border-y border-default py-5 sm:grid-cols-3">
        <div v-for="(question, index) in questions" :key="question" class="space-y-2">
          <p class="text-xs font-semibold tabular-nums text-primary">
            {{ String(index + 1).padStart(2, '0') }}
          </p>
          <p class="text-sm leading-6 text-highlighted">
            {{ question }}
          </p>
        </div>
      </section>

      <section id="lab-logs" class="grid gap-8 lg:grid-cols-[0.28fr_0.72fr]">
        <header class="space-y-3">
          <div class="flex items-center gap-3 text-primary">
            <UIcon name="i-lucide-book-open" class="size-5" />
            <span class="text-sm font-semibold tabular-nums">02</span>
          </div>
          <h2 class="mh-display text-2xl leading-tight font-semibold text-highlighted sm:text-3xl">
            {{ t('pages.labIndex.logsTitle') }}
          </h2>
          <p class="text-sm leading-6 text-muted">
            {{ t('pages.labIndex.logsDescription') }}
          </p>
        </header>

        <div>
          <div v-if="labNotes.length" class="divide-y divide-default border-y border-default">
            <NuxtLink
              v-for="note in labNotes"
              :key="note.id"
              :to="toPublicPath(note.path)"
              class="group block py-4 transition"
            >
              <div class="grid gap-3 sm:grid-cols-[8rem_1fr_auto] sm:items-start">
                <div class="space-y-1 text-xs leading-5 text-muted">
                  <span class="block font-medium text-primary">{{ t('badges.lab') }}</span>
                  <time v-if="note.date" class="block">{{ formatDate(note.date) }}</time>
                  <span v-if="note.status" class="block text-primary">{{ note.status }}</span>
                </div>

                <div class="min-w-0 space-y-1">
                  <h2
                    class="text-base leading-6 font-semibold text-highlighted group-hover:text-primary sm:text-lg"
                  >
                    {{ note.title }}
                  </h2>
                  <p class="line-clamp-2 text-sm leading-6 text-muted">
                    {{ note.description }}
                  </p>
                  <div v-if="note.tags?.length" class="flex flex-wrap gap-2 pt-1">
                    <span
                      v-for="tag in note.tags.slice(0, 3)"
                      :key="tag"
                      class="text-xs text-muted"
                    >
                      #{{ tag }}
                    </span>
                  </div>
                </div>

                <UIcon
                  name="i-lucide-arrow-right"
                  class="mt-1 size-4 text-muted transition group-hover:translate-x-1 group-hover:text-primary rtl:rotate-180 rtl:group-hover:-translate-x-1"
                />
              </div>
            </NuxtLink>
          </div>

          <UiEmpty v-else :title="t('empty.labTitle')" :description="t('empty.labDescription')" />
        </div>
      </section>

      <section
        id="prototype-state"
        class="grid gap-6 border-y border-default py-7 lg:grid-cols-[0.28fr_0.72fr]"
      >
        <div class="space-y-2">
          <div class="flex items-center gap-3 text-primary">
            <UIcon name="i-lucide-flask-conical" class="size-5" />
            <span class="text-sm font-semibold tabular-nums">03</span>
          </div>
          <h2 class="mh-display text-2xl font-semibold text-highlighted">
            {{ t('pages.labIndex.status.title') }}
          </h2>
        </div>
        <p class="text-sm leading-6 text-muted">
          {{ t('pages.labIndex.status.description') }}
        </p>
      </section>
    </UPageBody>
  </UPage>
</template>
