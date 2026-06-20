<script setup lang="ts">
import type { LeadTabItem, LeadTabKey } from '~/utils/lead-tabs'

const props = defineProps<{
  primaryTabs: LeadTabItem[]
  secondaryTabs: LeadTabItem[]
  activeTab: LeadTabKey
}>()

const emit = defineEmits<{
  'select-tab': [tab: LeadTabKey]
}>()

const { locale, t } = useI18n()

const activeSecondaryTab = computed(() =>
  props.secondaryTabs.find((tab) => tab.key === props.activeTab)
)

const isSecondaryActive = computed(() => Boolean(activeSecondaryTab.value))

const moreMenuItems = computed(() =>
  props.secondaryTabs.map((tab) => ({
    label:
      tab.count != null && tab.count > 0
        ? `${tab.label} (${formatLocalizedNumber(tab.count, locale.value)})`
        : tab.label,
    onSelect: () => emit('select-tab', tab.key)
  }))
)
</script>

<template>
  <nav class="shrink-0 border-b border-default bg-default" aria-label="Lead filters">
    <div
      class="flex min-w-0 items-stretch overflow-x-auto scrollbar-none"
      role="tablist"
    >
      <button
        v-for="tab in primaryTabs"
        :key="tab.key"
        type="button"
        role="tab"
        :aria-selected="activeTab === tab.key"
        class="relative shrink-0 whitespace-nowrap border-b-2 px-2.5 py-2 text-xs transition-colors sm:px-3 sm:py-2.5 sm:text-sm"
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
            {{ formatLocalizedNumber(tab.count, locale) }}
          </span>
        </span>
      </button>

      <UDropdownMenu :items="[moreMenuItems]" :content="{ align: 'start' }">
        <button
          type="button"
          role="tab"
          :aria-selected="isSecondaryActive"
          class="relative inline-flex shrink-0 items-center gap-1 whitespace-nowrap border-b-2 px-2.5 py-2 text-xs transition-colors sm:px-3 sm:py-2.5 sm:text-sm"
          :class="
            isSecondaryActive
              ? '-mb-px border-primary font-medium text-primary'
              : 'border-transparent text-muted hover:border-default hover:text-highlighted'
          "
        >
          <span v-if="activeSecondaryTab">{{ activeSecondaryTab.label }}</span>
          <span v-else>{{ t('dashboard.leads.tabs.more') }}</span>
          <UIcon name="i-lucide-chevron-down" class="size-3.5" />
        </button>
      </UDropdownMenu>
    </div>
  </nav>
</template>
