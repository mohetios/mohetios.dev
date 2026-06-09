<script setup lang="ts">
import {
  DASHBOARD_ANALYTICS_RANGES,
  DASHBOARD_RANGE_LABEL_KEYS
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
  variant: 'soft' as const,
  size: 'sm' as const
}

const rangeMenuItems = computed(() => [
  DASHBOARD_ANALYTICS_RANGES.map((value) => ({
    label: t(DASHBOARD_RANGE_LABEL_KEYS[value]),
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
      <div class="flex min-w-0 items-center gap-2">
        <UDashboardSidebarCollapse  class="shrink-0" />
        <UDashboardSearchButton
          variant="soft"
          class="hidden max-w-xs min-w-0 flex-1 sm:flex"
          :label="t('dashboard.search.placeholder')"
        />
        <UDashboardSearchButton collapsed tooltip class="shrink-0 sm:hidden" />
      </div>
    </template>

    <template #right>
      <div v-if="preset" class="flex flex-wrap items-center justify-end gap-2">
        <UDropdownMenu v-if="preset.showRange" :items="rangeMenuItems">
          <UButton
            v-bind="toolbarButton"
            icon="i-lucide-calendar-days"
            :aria-label="t(DASHBOARD_RANGE_LABEL_KEYS[range])"
          >
            <span class="hidden items-center gap-1 sm:inline-flex">
              <span class="max-w-[8.5rem] truncate sm:max-w-none">
                {{ t(DASHBOARD_RANGE_LABEL_KEYS[range]) }}
              </span>
              <UIcon name="i-lucide-chevron-down" class="size-4 shrink-0" />
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
          :aria-label="t(action.labelKey)"
        >
          <span class="hidden sm:inline">
            {{ t(action.labelKey) }}
          </span>
        </UButton>

        <UButton
          v-bind="toolbarButton"
          :disabled="runtime.isRefreshing.value"
          :aria-label="t(preset.refreshLabelKey)"
          @click="handleRefresh"
        >
          <template #leading>
            <UIcon
              :name="runtime.isRefreshing.value ? 'i-lucide-loader-circle' : 'i-lucide-refresh-cw'"
              class="size-4"
              :class="{ 'animate-spin': runtime.isRefreshing.value }"
            />
          </template>
          <span class="hidden sm:inline">
            {{ t(preset.refreshLabelKey) }}
          </span>
        </UButton>

        <USeparator orientation="vertical" class="hidden h-6 sm:block" />

        <UColorModeButton   size="sm" />
      </div>

      <UColorModeButton v-else color="neutral" variant="soft" size="sm" />
    </template>
  </UDashboardNavbar>
</template>
