<script setup lang="ts">
import { formatChartNumber } from '~/utils/dashboard-charts'

type BarItem = {
  label: string
  value: number
  helper?: string
}

const props = defineProps<{
  items: BarItem[]
  maxItems?: number
  valueFormatter?: (value: number) => string
  loading?: boolean
  label?: string
}>()

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

const xFormatter = (index: number) => chartData.value[index]?.label || ''
const yFormatter = (value: number) =>
  props.valueFormatter ? props.valueFormatter(value) : formatChartNumber(value)
</script>

<template>
  <div>
    <div v-if="loading" class="space-y-3">
      <USkeleton v-for="index in 4" :key="index" class="h-10 w-full" />
    </div>

    <p v-else-if="!visibleItems.length" class="py-6 text-center text-sm text-muted">
      <slot name="empty" />
    </p>

    <ClientOnly v-else>
      <BarChart
        :data="chartData"
        :categories="categories"
        :height="300"
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
        <USkeleton class="h-[300px] w-full" />
      </template>
    </ClientOnly>
  </div>
</template>
