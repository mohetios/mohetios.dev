<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

useMohetSeo({
  title: 'Analytics',
  description: 'Private dashboard analytics placeholder.'
})
</script>

<template>
  <UDashboardPanel id="dashboard-analytics">
    <template #header>
      <UDashboardNavbar title="Analytics" icon="i-lucide-chart-column">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <DashboardHeaderActions />
        </template>
      </UDashboardNavbar>
    </template>

    <div class="p-4 sm:p-6">
      <UAlert
        color="neutral"
        variant="soft"
        icon="i-lucide-chart-column"
        title="No analytics yet"
        description="Analytics summaries will appear here when tracking is connected."
      />
    </div>
  </UDashboardPanel>
</template>
