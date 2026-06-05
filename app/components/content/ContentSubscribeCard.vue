<script setup lang="ts">
defineProps<{
  kind: 'blog' | 'lab' | 'project'
  size: 'compact' | 'large'
}>()

const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <UCard
    :variant="size === 'compact' ? 'subtle' : 'outline'"
    :class="size === 'large' ? 'p-1' : ''"
  >
    <div :class="size === 'large' ? 'space-y-4 p-4 sm:p-6' : 'space-y-3'">
      <div>
        <p
          :class="
            size === 'large'
              ? 'text-ui-lg font-semibold tracking-tight text-highlighted'
              : 'text-ui-sm font-medium text-highlighted'
          "
        >
          {{ t(`content.subscribe.${kind}.title`) }}
        </p>
        <p class="mt-2 text-ui-sm leading-6 text-muted">
          {{ t(`content.subscribe.${kind}.description`) }}
        </p>
      </div>

      <template v-if="kind === 'project'">
        <UButton :to="localePath('/contact')" color="primary" variant="soft" icon="i-lucide-mail">
          {{ t('content.subscribe.project.action') }}
        </UButton>
      </template>

      <template v-else>
        <UInput
          type="email"
          :placeholder="t(`content.subscribe.${kind}.placeholder`)"
          disabled
          class="w-full"
          size="md"
        />
        <p class="text-ui-xs text-muted">
          {{ t(`content.subscribe.${kind}.comingSoon`) }}
        </p>
      </template>
    </div>
  </UCard>
</template>
