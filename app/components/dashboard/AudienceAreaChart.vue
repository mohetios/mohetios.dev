<script setup lang="ts">
import {
  formatChartNumber,
  getAudienceCategories,
  toAudienceChartRows,
  type AudienceMetricMode,
  type AudienceTrendChartPoint
} from '~/utils/dashboard-charts'
import { dashboardChartMinHeightPx } from '~/utils/dashboard-ui'

const props = withDefaults(
  defineProps<{
    points: AudienceTrendChartPoint[]
    metric?: AudienceMetricMode
    loading?: boolean
    height?: number
    minHeight?: number
    ariaLabel?: string
  }>(),
  {
    metric: 'both',
    loading: false,
    height: undefined,
    minHeight: dashboardChartMinHeightPx,
    ariaLabel: 'Audience trend chart'
  }
)

const chartContainer = useChartContainerHeight(props.minHeight)
const measuredHeight = chartContainer.height

const chartData = computed(() => toAudienceChartRows(props.points))
const categories = computed(() => getAudienceCategories(props.metric))

const isEmpty = computed(() =>
  props.points.every((point) => point.visitors === 0 && point.pageViews === 0)
)

const chartHeight = computed(() => props.height ?? measuredHeight.value)

const xFormatter = (index: number) => chartData.value[index]?.date || ''
const yFormatter = (value: number) => formatChartNumber(value)
</script>

<template>
  <div class="relative min-h-0 flex-1" role="img" :aria-label="ariaLabel">
    <div v-if="loading" class="absolute inset-0">
      <USkeleton class="h-full w-full" />
    </div>

    <div
      v-else-if="isEmpty"
      class="absolute inset-0 flex items-center justify-center text-center text-sm text-muted"
    >
      <slot name="empty" />
    </div>

    <div v-else :ref="chartContainer.containerRef" class="absolute inset-0 overflow-hidden">
      <ClientOnly>
        <AreaChart
          :data="chartData"
          :categories="categories"
          :height="chartHeight"
          :x-formatter="xFormatter"
          :y-formatter="yFormatter"
          :y-grid-line="true"
          :x-grid-line="false"
          :curve-type="CurveType.MonotoneX"
          :legend-position="LegendPosition.Bottom"
          :hide-legend="metric !== 'both'"
        />

        <template #fallback>
          <USkeleton class="h-full w-full" />
        </template>
      </ClientOnly>
    </div>
  </div>
</template>
