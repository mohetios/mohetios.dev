<script setup lang="ts">
import { dashboardPanelBodyUi } from '~/utils/dashboard-ui'

const { t, locale, loadLocaleMessages } = useI18n()
const { groups, searchTerm } = useDashboardSearch()

const localeCookie = useCookie<typeof locale.value | null>('mohetios_locale', {
  path: '/',
  sameSite: 'lax'
})
const isApplyingPanelLocale = ref(false)

const savedPanelLocale = computed(() =>
  supportedLocales.find((code) => code === localeCookie.value)
)

watchEffect(() => {
  if (savedPanelLocale.value && locale.value !== savedPanelLocale.value) {
    void applyPanelLocale(savedPanelLocale.value)
  }
})

watch(locale, (value) => {
  if (!isApplyingPanelLocale.value) {
    localeCookie.value = value
  }
})

async function applyPanelLocale(value: typeof locale.value) {
  isApplyingPanelLocale.value = true

  try {
    await loadLocaleMessages(value)
    locale.value = value
  } finally {
    isApplyingPanelLocale.value = false
  }
}
</script>

<template>
  <UDashboardGroup storage-key="mohetios-dashboard">
    <DashboardSidebar />

    <UDashboardSearch
      v-model:search-term="searchTerm"
      :groups="groups"
      :color-mode="false"
      :placeholder="t('dashboard.search.placeholder')"
    />

    <UDashboardPanel id="dashboard-main" :ui="dashboardPanelBodyUi">
      <template #header>
        <DashboardTopbar />
      </template>

      <template #body>
        <slot />
      </template>
    </UDashboardPanel>

    <PwaPrompt />
  </UDashboardGroup>
</template>
