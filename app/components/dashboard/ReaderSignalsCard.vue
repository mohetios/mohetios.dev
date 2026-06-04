<script setup lang="ts">
import type { ReaderSignal } from '~/data/dashboard.mock'

defineProps<{
  signals: {
    referrers: ReaderSignal[]
    countries: ReaderSignal[]
    tags: ReaderSignal[]
  }
}>()

const { t } = useI18n()

const sections = computed(() => [
  { key: 'referrers', title: t('dashboard.overview.referrers'), itemsKey: 'referrers' as const },
  { key: 'countries', title: t('dashboard.overview.countries'), itemsKey: 'countries' as const },
  { key: 'tags', title: t('dashboard.overview.tags'), itemsKey: 'tags' as const }
])
</script>

<template>
  <DashboardSectionCard
    :title="t('dashboard.overview.readerSignals')"
    class="h-full"
  >
    <div class="space-y-5">
      <div
        v-for="section in sections"
        :key="section.key"
      >
        <p class="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
          {{ section.title }}
        </p>

        <ul class="space-y-2">
          <li
            v-for="item in signals[section.itemsKey]"
            :key="item.label"
            class="flex items-center justify-between gap-2 text-sm"
          >
            <span class="truncate text-muted">{{ item.label }}</span>
            <span class="shrink-0 font-medium text-highlighted">{{ item.value }}</span>
          </li>
        </ul>
      </div>
    </div>
  </DashboardSectionCard>
</template>
