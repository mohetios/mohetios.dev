<script setup lang="ts">
import { dashboardPanelBodyUi } from '~/utils/dashboard-ui'
</script>

<template>
  <UDashboardGroup storage-key="mohetios-dashboard">
    <DashboardSidebar />

    <UDashboardPanel id="dashboard-main" :ui="dashboardPanelBodyUi">
      <template #header>
        <DashboardTopbar />
      </template>

      <template #body>
        <slot />
      </template>
    </UDashboardPanel>

    <PwaInstallPrompt />
  </UDashboardGroup>
</template>
