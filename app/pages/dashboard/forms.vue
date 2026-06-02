<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

useMohetSeo({
  title: 'Forms',
  description: 'Private dashboard form submissions placeholder.'
})
</script>

<template>
  <UDashboardPanel id="dashboard-forms">
    <template #header>
      <UDashboardNavbar title="Forms" icon="i-lucide-file-text">
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
        icon="i-lucide-file-text"
        title="No forms yet"
        description="Form submissions will appear here after public forms are connected."
      />
    </div>
  </UDashboardPanel>
</template>
