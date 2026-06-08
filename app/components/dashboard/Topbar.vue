<script setup lang="ts">
import {
  DASHBOARD_ANALYTICS_RANGES,
  type DashboardAnalyticsRange
} from '~~/shared/constants/dashboard-range'

const { t } = useI18n()
const localePath = useLocalePath()

const route = useRoute()
const preset = useDashboardToolbarPreset()
const runtime = useDashboardToolbarRuntime()
const range = useDashboardRangePreference()

watch(
  () => route.path,
  () => {
    runtime.isRefreshing.value = false
  }
)

const toolbarButton = {
  color: 'neutral' as const,
  variant: 'outline' as const,
  size: 'sm' as const
}

const rangeLabels: Record<DashboardAnalyticsRange, string> = {
  LAST_7_DAYS: 'dashboard.analytics.ranges.last7Days',
  LAST_30_DAYS: 'dashboard.analytics.ranges.last30Days',
  LAST_90_DAYS: 'dashboard.analytics.ranges.last90Days'
}

const rangeMenuItems = computed(() => [
  DASHBOARD_ANALYTICS_RANGES.map((value) => ({
    label: t(rangeLabels[value]),
    icon: range.value === value ? 'i-lucide-check' : undefined,
    onSelect: () => {
      range.value = value
    }
  }))
])

async function handleRefresh() {
  if (!runtime.refreshHandler) {
    return
  }

  await runtime.refreshHandler()
}
</script>

<template>
  <UDashboardNavbar class="border-b border-default bg-default/90 backdrop-blur" :toggle="false">
    <template #left>
      <UDashboardSidebarCollapse class="shrink-0" />
    </template>

    <template #right>
      <div v-if="preset" class="flex flex-wrap items-center justify-end gap-2">
        <UDropdownMenu v-if="preset.showRange" :items="rangeMenuItems">
          <UButton
            v-bind="toolbarButton"
            icon="i-lucide-calendar-days"
            trailing-icon="i-lucide-chevron-down"
          >
            <span class="max-w-[8.5rem] truncate sm:max-w-none">
              {{ t(rangeLabels[range]) }}
            </span>
          </UButton>
        </UDropdownMenu>

        <UButton
          v-for="action in preset.actions"
          :key="action.id"
          v-bind="toolbarButton"
          :icon="action.icon"
          :to="action.to ? localePath(action.to) : undefined"
          :disabled="action.disabled"
        >
          {{ t(action.labelKey) }}
        </UButton>

        <UButton
          v-bind="toolbarButton"
          :disabled="runtime.isRefreshing.value"
          @click="handleRefresh"
        >
          <template #leading>
            <UIcon
              :name="runtime.isRefreshing.value ? 'i-lucide-loader-circle' : 'i-lucide-refresh-cw'"
              class="size-4"
              :class="{ 'animate-spin': runtime.isRefreshing.value }"
            />
          </template>
          {{ t(preset.refreshLabelKey) }}
        </UButton>

        <USeparator orientation="vertical" class="hidden h-6 sm:block" />

        <div class="flex items-center gap-0.5">
          <UDashboardSearchButton collapsed tooltip :kbds="[]" />
          <UColorModeButton color="neutral" variant="ghost" size="sm" />
        </div>
      </div>

      <div v-else class="flex items-center gap-0.5">
        <UDashboardSearchButton collapsed tooltip :kbds="[]" />
        <UColorModeButton color="neutral" variant="ghost" size="sm" />
      </div>
    </template>
  </UDashboardNavbar>
</template>
