<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth'],
  requiredPermission: 'inbox:manage'
})

const route = useRoute()

await navigateTo({
  path: '/dashboard/inbox',
  query: {
    message: String(route.params.id)
  }
})
</script>

<template>
  <div />
</template>
