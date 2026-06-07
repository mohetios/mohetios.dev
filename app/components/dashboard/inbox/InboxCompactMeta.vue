<script setup lang="ts">
import type { InboxMessage } from '~/utils/inbox-thread'
import {
  formatMessageTime,
  getCategoryColor,
  getCategoryLabel,
  getSourceLabel,
  getStatusColor,
  getStatusLabel
} from '~/utils/inbox-thread'

defineProps<{
  message: InboxMessage
}>()

const { t } = useI18n()

const isOpen = ref(false)
</script>

<template>
  <UCollapsible v-model:open="isOpen" class="border-b border-default">
    <button
      type="button"
      class="flex w-full items-center justify-between gap-2 px-4 py-2 text-sm text-muted transition hover:bg-muted/30"
    >
      <span>{{ t('dashboard.inbox.details.title') }}</span>
      <UIcon
        name="i-lucide-chevron-down"
        class="size-4 transition"
        :class="{ 'rotate-180': isOpen }"
      />
    </button>

    <template #content>
      <dl class="space-y-2.5 px-4 pb-3 text-sm">
        <div class="flex items-start justify-between gap-3">
          <dt class="text-muted">{{ t('dashboard.inbox.contact.name') }}</dt>
          <dd class="text-end text-highlighted">{{ message.senderName }}</dd>
        </div>
        <div class="flex items-start justify-between gap-3">
          <dt class="text-muted">{{ t('dashboard.inbox.contact.email') }}</dt>
          <dd class="truncate text-end text-highlighted">{{ message.senderEmail }}</dd>
        </div>
        <div v-if="message.senderCompany" class="flex items-start justify-between gap-3">
          <dt class="text-muted">{{ t('dashboard.inbox.contact.company') }}</dt>
          <dd class="text-end text-highlighted">{{ message.senderCompany }}</dd>
        </div>
        <div v-if="message.senderWebsite" class="flex items-start justify-between gap-3">
          <dt class="text-muted">{{ t('dashboard.inbox.contact.website') }}</dt>
          <dd class="truncate text-end text-highlighted">{{ message.senderWebsite }}</dd>
        </div>
        <div class="flex items-center justify-between gap-3">
          <dt class="text-muted">{{ t('dashboard.inbox.details.source') }}</dt>
          <dd>
            <UBadge color="neutral" variant="outline" size="xs">
              {{ getSourceLabel(message.source) }}
            </UBadge>
          </dd>
        </div>
        <div class="flex items-center justify-between gap-3">
          <dt class="text-muted">{{ t('dashboard.inbox.details.status') }}</dt>
          <dd>
            <UBadge :color="getStatusColor(message.status)" variant="subtle" size="xs">
              {{ getStatusLabel(message.status) }}
            </UBadge>
          </dd>
        </div>
        <div class="flex items-center justify-between gap-3">
          <dt class="text-muted">{{ t('dashboard.inbox.details.kind') }}</dt>
          <dd>
            <UBadge :color="getCategoryColor(message.kind)" variant="soft" size="xs">
              {{ getCategoryLabel(message.kind) }}
            </UBadge>
          </dd>
        </div>
        <div class="flex items-center justify-between gap-3">
          <dt class="text-muted">{{ t('dashboard.inbox.details.received') }}</dt>
          <dd class="text-highlighted">{{ message.time }}</dd>
        </div>
        <div
          v-if="message.trashedAt"
          class="flex items-center justify-between gap-3"
        >
          <dt class="text-muted">{{ t('dashboard.inbox.details.trashed') }}</dt>
          <dd class="text-highlighted">
            {{ formatMessageTime(message.trashedAt) }}
          </dd>
        </div>
        <div class="flex items-start justify-between gap-3">
          <dt class="shrink-0 text-muted">{{ t('dashboard.inbox.details.messageId') }}</dt>
          <dd class="truncate font-mono text-xs text-highlighted">{{ message.id }}</dd>
        </div>
      </dl>
    </template>
  </UCollapsible>
</template>
