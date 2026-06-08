<script setup lang="ts">
import type { InboxTabItem, InboxTabKey } from '~/utils/inbox-tabs'

const props = defineProps<{
  primaryTabs: InboxTabItem[]
  secondaryTabs: InboxTabItem[]
  activeTab: InboxTabKey
}>()

const emit = defineEmits<{
  'select-tab': [tab: InboxTabKey]
}>()

const { t } = useI18n()

const activeSecondaryTab = computed(() =>
  props.secondaryTabs.find((tab) => tab.key === props.activeTab)
)

const isSecondaryActive = computed(() => Boolean(activeSecondaryTab.value))

const moreMenuItems = computed(() =>
  props.secondaryTabs.map((tab) => ({
    label: tab.count != null && tab.count > 0 ? `${tab.label} (${tab.count})` : tab.label,
    onSelect: () => emit('select-tab', tab.key)
  }))
)
</script>

<template>
  <nav class="shrink-0 border-b border-default bg-default" aria-label="Inbox filters">
    <div class="flex items-stretch overflow-x-auto scrollbar-none" role="tablist">
      <button
        v-for="tab in primaryTabs"
        :key="tab.key"
        type="button"
        role="tab"
        :aria-selected="activeTab === tab.key"
        class="relative shrink-0 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm transition-colors"
        :class="
          activeTab === tab.key
            ? '-mb-px border-primary font-medium text-primary'
            : 'border-transparent text-muted hover:border-default hover:text-highlighted'
        "
        @click="emit('select-tab', tab.key)"
      >
        <span class="inline-flex items-center gap-1.5">
          {{ tab.label }}
          <span
            v-if="tab.count != null && tab.count > 0"
            class="tabular-nums"
            :class="activeTab === tab.key ? 'text-primary/80' : 'text-muted'"
          >
            {{ tab.count }}
          </span>
        </span>
      </button>

      <UDropdownMenu :items="[moreMenuItems]" :content="{ align: 'start' }">
        <button
          type="button"
          role="tab"
          :aria-selected="isSecondaryActive"
          class="relative inline-flex shrink-0 items-center gap-1 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm transition-colors"
          :class="
            isSecondaryActive
              ? '-mb-px border-primary font-medium text-primary'
              : 'border-transparent text-muted hover:border-default hover:text-highlighted'
          "
        >
          <span v-if="activeSecondaryTab">{{ activeSecondaryTab.label }}</span>
          <span v-else>{{ t('dashboard.inbox.tabs.more') }}</span>
          <UIcon name="i-lucide-chevron-down" class="size-3.5" />
        </button>
      </UDropdownMenu>
    </div>
  </nav>
</template>
