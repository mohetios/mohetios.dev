import { dashboardChartMinHeightPx } from '~/utils/dashboard-ui'

export function useChartContainerHeight(minHeight = dashboardChartMinHeightPx) {
  const containerRef = ref<HTMLElement | null>(null)
  const height = ref(minHeight)

  const updateHeight = () => {
    const element = containerRef.value

    if (!element) {
      return
    }

    const nextHeight = Math.max(minHeight, Math.round(element.clientHeight))

    if (nextHeight !== height.value) {
      height.value = nextHeight
    }
  }

  watch(
    containerRef,
    (element, _, onCleanup) => {
      if (!element) {
        return
      }

      updateHeight()

      const observer = new ResizeObserver(() => {
        updateHeight()
      })

      observer.observe(element)

      onCleanup(() => {
        observer.disconnect()
      })
    },
    { flush: 'post' }
  )

  return {
    containerRef,
    height
  }
}
