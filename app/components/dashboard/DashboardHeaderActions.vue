<script setup lang="ts">
const { accountLabel, accountMenuItems } = useDashboardAccountMenu()
</script>

<template>
  <div class="flex items-center justify-center gap-1.5">
    <UDashboardSearchButton collapsed tooltip :kbds="[]" />
    <UColorModeButton color="neutral" variant="ghost" />

    <UDropdownMenu :items="accountMenuItems">
      <UButton
        color="neutral"
        variant="ghost"
        square
        icon="i-lucide-circle-user-round"
        :aria-label="accountLabel"
      />
    </UDropdownMenu>
  </div>
</template>
