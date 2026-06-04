<script setup lang="ts">
import type { InboxMessage } from '~/utils/inbox-thread'
import {
  getCategoryColor,
  getCategoryLabel,
  getSourceLabel,
  getStatusColor,
  getStatusLabel
} from '~/utils/inbox-thread'
import { dashboardCardUi } from '~/utils/dashboard-ui'

defineProps<{
  message: InboxMessage
}>()

const { t } = useI18n()
</script>

<template>
  <UCard variant="outline" :ui="dashboardCardUi">
    <template #header>
      <h3 class="text-sm font-semibold text-highlighted">
        {{ t('dashboard.inbox.details.title') }}
      </h3>
    </template>

    <dl class="space-y-3 text-sm">
      <div class="flex items-center justify-between gap-3">
        <dt class="text-muted">{{ t('dashboard.inbox.details.source') }}</dt>
        <dd>
          <UBadge color="neutral" variant="outline" size="sm">
            {{ getSourceLabel(message.source) }}
          </UBadge>
        </dd>
      </div>
      <div class="flex items-center justify-between gap-3">
        <dt class="text-muted">{{ t('dashboard.inbox.details.kind') }}</dt>
        <dd>
          <UBadge :color="getCategoryColor(message.kind)" variant="soft" size="sm">
            {{ getCategoryLabel(message.kind) }}
          </UBadge>
        </dd>
      </div>
      <div class="flex items-center justify-between gap-3">
        <dt class="text-muted">{{ t('dashboard.inbox.details.status') }}</dt>
        <dd>
          <UBadge :color="getStatusColor(message.status)" variant="subtle" size="sm">
            {{ getStatusLabel(message.status) }}
          </UBadge>
        </dd>
      </div>
      <div class="flex items-center justify-between gap-3">
        <dt class="text-muted">{{ t('dashboard.inbox.details.received') }}</dt>
        <dd class="text-highlighted">{{ message.time }}</dd>
      </div>
      <div class="flex items-start justify-between gap-3">
        <dt class="shrink-0 text-muted">{{ t('dashboard.inbox.details.messageId') }}</dt>
        <dd class="truncate font-mono text-xs text-highlighted">{{ message.id }}</dd>
      </div>
    </dl>
  </UCard>
</template>
