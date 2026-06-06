export type AudienceMetricMode = 'visitors' | 'pageViews' | 'both'

export type AudienceTrendChartPoint = {
  date: string
  visitors: number
  pageViews: number
}

export const audienceMetricColors = {
  visitors: {
    name: 'Visitors',
    color: '#2f628a'
  },
  pageViews: {
    name: 'Page views',
    color: '#7ea8ca'
  }
} as const

export function formatChartNumber(value: number) {
  return new Intl.NumberFormat().format(Math.round(value || 0))
}

export function toAudienceChartRows(points: AudienceTrendChartPoint[]) {
  return points.map((point) => ({
    date: point.date.slice(5),
    visitors: point.visitors,
    pageViews: point.pageViews
  }))
}

type ChartCategory = {
  name: string
  color: string
}

export function getAudienceCategories(
  metric: AudienceMetricMode
): Record<string, ChartCategory> {
  if (metric === 'visitors') {
    return {
      visitors: { ...audienceMetricColors.visitors }
    }
  }

  if (metric === 'pageViews') {
    return {
      pageViews: { ...audienceMetricColors.pageViews }
    }
  }

  return {
    visitors: { ...audienceMetricColors.visitors },
    pageViews: { ...audienceMetricColors.pageViews }
  }
}

export function rankedBarHeight(itemCount: number, min = 220, row = 34) {
  return Math.max(min, itemCount * row)
}
