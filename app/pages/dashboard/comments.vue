<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

useMohetSeo({
  title: 'Comments',
  description: 'Private dashboard comment moderation placeholder.'
})
</script>

<template>
  <UDashboardPanel id="dashboard-comments">
    <template #header>
      <UDashboardNavbar title="Comments" icon="i-lucide-message-square">
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
        icon="i-lucide-message-square"
        title="No comments yet"
        description="Comment moderation will be connected when public comments are added."
      />
    </div>
  </UDashboardPanel>
</template>
