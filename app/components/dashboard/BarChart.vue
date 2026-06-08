<script setup lang="ts">
import { formatChartNumber } from '~/utils/dashboard-charts'
import { dashboardChartMinHeightPx } from '~/utils/dashboard-ui'

type BarItem = {
  label: string
  value: number
  helper?: string
}

const props = withDefaults(
  defineProps<{
    items: BarItem[]
    maxItems?: number
    valueFormatter?: (value: number) => string
    loading?: boolean
    label?: string
    height?: number
    minHeight?: number
  }>(),
  {
    maxItems: 8,
    valueFormatter: undefined,
    loading: false,
    label: undefined,
    height: undefined,
    minHeight: dashboardChartMinHeightPx
  }
)

const { containerRef, height: measuredHeight } = useChartContainerHeight(props.minHeight)

const visibleItems = computed(() => props.items.slice(0, props.maxItems ?? 8))

const chartData = computed(() =>
  visibleItems.value.map((item) => ({
    label: item.label.length > 28 ? `${item.label.slice(0, 25)}...` : item.label,
    value: item.value
  }))
)

const categories = computed(() => ({
  value: {
    name: props.label || 'Value',
    color: '#2f628a'
  }
}))

const chartHeight = computed(() => props.height ?? measuredHeight.value)

const xFormatter = (index: number) => chartData.value[index]?.label || ''
const yFormatter = (value: number) =>
  props.valueFormatter ? props.valueFormatter(value) : formatChartNumber(value)
</script>

<template>
  <div class="relative min-h-0 flex-1">
    <div v-if="loading" class="absolute inset-0 space-y-3">
      <USkeleton v-for="index in 4" :key="index" class="h-10 w-full" />
    </div>

    <div
      v-else-if="!visibleItems.length"
      class="absolute inset-0 flex items-center justify-center text-center text-sm text-muted"
    >
      <slot name="empty" />
    </div>

    <div v-else ref="containerRef" class="absolute inset-0 overflow-hidden">
      <ClientOnly>
        <BarChart
          :data="chartData"
          :categories="categories"
          :height="chartHeight"
          :y-axis="['value']"
          x-axis="label"
          :x-formatter="xFormatter"
          :y-formatter="yFormatter"
          :y-grid-line="true"
          :hide-legend="true"
          :radius="4"
          :x-num-ticks="chartData.length"
          :min-max-ticks-only="chartData.length > 6"
        />

        <template #fallback>
          <USkeleton class="h-full w-full" />
        </template>
      </ClientOnly>
    </div>
  </div>
</template>
