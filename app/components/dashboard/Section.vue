<script setup lang="ts">
import { dashboardCardUi } from '~/utils/dashboard-ui'

defineOptions({
  inheritAttrs: false
})

defineProps<{
  title: string
  to?: string
  linkLabel?: string
}>()

const localePath = useLocalePath()
</script>

<template>
  <UCard v-bind="$attrs" variant="outline" :ui="dashboardCardUi">
    <template #header>
      <div class="flex items-center justify-between gap-3">
        <h2 class="text-base font-semibold text-highlighted">
          {{ title }}
        </h2>

        <UButton
          v-if="to"
          :to="localePath(to)"
          color="neutral"
          variant="ghost"
          size="xs"
          trailing-icon="i-lucide-arrow-right"
        >
          {{ linkLabel }}
        </UButton>
      </div>
    </template>

    <slot />
  </UCard>
</template>
