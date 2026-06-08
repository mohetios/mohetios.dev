<script setup lang="ts">
import { dashboardPanelBodyUi } from '~/utils/dashboard-ui'

const { t } = useI18n()
const { groups, searchTerm } = useDashboardSearch()
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
