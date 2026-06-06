<script setup lang="ts">
import {
  formatChartNumber,
  getAudienceCategories,
  toAudienceChartRows,
  type AudienceMetricMode,
  type AudienceTrendChartPoint
} from '~/utils/dashboard-charts'

const props = withDefaults(
  defineProps<{
    points: AudienceTrendChartPoint[]
    metric?: AudienceMetricMode
    loading?: boolean
    height?: number
    ariaLabel?: string
  }>(),
  {
    metric: 'both',
    height: 280,
    ariaLabel: 'Audience trend chart'
  }
)

const chartData = computed(() => toAudienceChartRows(props.points))
const categories = computed(() => getAudienceCategories(props.metric))

const isEmpty = computed(() =>
  props.points.every((point) => point.visitors === 0 && point.pageViews === 0)
)

const xFormatter = (index: number) => chartData.value[index]?.date || ''
const yFormatter = (value: number) => formatChartNumber(value)
</script>

<template>
  <div role="img" :aria-label="ariaLabel">
    <div v-if="loading" class="min-h-48">
      <USkeleton class="h-full w-full" :style="{ minHeight: `${height}px` }" />
    </div>

    <p v-else-if="isEmpty" class="py-10 text-center text-sm text-muted">
      <slot name="empty" />
    </p>

    <ClientOnly v-else>
      <AreaChart
        :data="chartData"
        :categories="categories"
        :height="height"
        :x-formatter="xFormatter"
        :y-formatter="yFormatter"
        :y-grid-line="true"
        :x-grid-line="false"
        :curve-type="CurveType.MonotoneX"
        :legend-position="LegendPosition.Bottom"
        :hide-legend="metric !== 'both'"
      />

      <template #fallback>
        <USkeleton class="w-full" :style="{ height: `${height}px` }" />
      </template>
    </ClientOnly>
  </div>
</template>
