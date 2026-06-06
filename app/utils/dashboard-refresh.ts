import type { Ref } from 'vue'

const MIN_DASHBOARD_REFRESH_MS = 500

export async function withDashboardRefresh<T>(
  isRefreshing: Ref<boolean>,
  task: () => Promise<T>
): Promise<T> {
  isRefreshing.value = true
  const startedAt = Date.now()

  try {
    return await task()
  } finally {
    const remainingMs = MIN_DASHBOARD_REFRESH_MS - (Date.now() - startedAt)

    if (remainingMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, remainingMs))
    }

    isRefreshing.value = false
  }
}
