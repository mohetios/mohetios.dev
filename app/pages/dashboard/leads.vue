<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

useMohetSeo({
  title: 'Leads',
  description: 'Private dashboard lead queue placeholder.'
})
</script>

<template>
  <UDashboardPanel id="dashboard-leads">
    <template #header>
      <UDashboardNavbar title="Leads" icon="i-lucide-users">
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
        icon="i-lucide-users"
        title="No leads yet"
        description="Lead collection will be connected when public forms are added."
      />
    </div>
  </UDashboardPanel>
</template>
