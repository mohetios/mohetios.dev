<script setup lang="ts">
defineProps<{
  collapsed?: boolean
}>()

const { user, accountMenuItems } = useDashboardAccountMenu()
</script>

<template>
  <UDropdownMenu
    :items="accountMenuItems"
    :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{ content: collapsed ? 'w-48' : 'w-(--reka-dropdown-menu-trigger-width)' }"
  >
    <UButton
      v-bind="{
        ...user,
        label: collapsed ? undefined : user.name,
        trailingIcon: collapsed ? undefined : 'i-lucide-chevrons-up-down'
      }"
      :avatar="{ ...user.avatar, size: 'lg' }"
      color="neutral"
      variant="ghost"
      block
      :square="collapsed"
      class="data-[state=open]:bg-elevated"
      :ui="{ trailingIcon: 'text-dimmed', leadingAvatarSize: 'lg' }"
    />
  </UDropdownMenu>
</template>
