import searchData from '~~/shared/data/dashboard-search.json'

type DashboardSearchItem = {
  id: string
  labelKey: string
  descriptionKey?: string
  icon?: string
  to?: string
}

type DashboardSearchGroup = {
  id: string
  labelKey: string
  items: DashboardSearchItem[]
}

export function useDashboardSearch() {
  const { t } = useI18n()
  const localePath = useLocalePath()

  const groups = computed(() =>
    (searchData.groups as DashboardSearchGroup[]).map((group) => ({
      id: group.id,
      label: t(group.labelKey),
      items: group.items.map((item) => ({
        id: item.id,
        label: t(item.labelKey),
        description: item.descriptionKey ? t(item.descriptionKey) : undefined,
        icon: item.icon,
        to: item.to ? localePath(item.to) : undefined
      }))
    }))
  )

  const searchTerm = ref('')

  return {
    groups,
    searchTerm
  }
}
