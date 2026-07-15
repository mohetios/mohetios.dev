<script setup lang="ts">
import type { DashboardHome } from '~/composables/useDashboardHome'

defineProps<{
  signals: DashboardHome['readerSignals']
  loading?: boolean
}>()

const { t, te } = useI18n()

function signalLabel(signal: DashboardHome['readerSignals'][number]) {
  const key = `dashboard.home.readerSignals.items.${signal.key}.label`
  return te(key) ? t(key) : signal.label
}

function signalHelper(signal: DashboardHome['readerSignals'][number]) {
  const key = `dashboard.home.readerSignals.items.${signal.key}.helper`
  return te(key) ? t(key) : signal.helper
}
</script>

<template>
  <DashboardSection :title="t('dashboard.overview.readerSignals')" class="h-full">
    <div v-if="loading" class="space-y-3">
      <USkeleton v-for="index in 3" :key="index" class="h-14 w-full" />
    </div>

    <p v-else-if="!signals.length" class="text-sm text-muted">
      {{ t('dashboard.home.readerSignals.empty') }}
    </p>

    <ul v-else class="space-y-3">
      <li
        v-for="signal in signals"
        :key="signal.key"
        class="rounded-xl border border-default bg-muted/20 p-3"
      >
        <div class="flex items-start gap-3">
          <div
            class="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary"
          >
            <UIcon :name="signal.icon" class="size-4" />
          </div>

          <div class="min-w-0 flex-1">
            <div class="flex items-center justify-between gap-2">
              <p class="text-sm font-medium text-highlighted">
                {{ signalLabel(signal) }}
              </p>
              <p class="text-lg font-semibold text-highlighted">
                {{ signal.value }}
              </p>
            </div>
            <p class="mt-1 text-xs text-muted">
              {{ signalHelper(signal) }}
            </p>
          </div>
        </div>
      </li>
    </ul>
  </DashboardSection>
</template>
