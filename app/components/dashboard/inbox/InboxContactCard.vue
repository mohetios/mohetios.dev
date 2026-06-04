<script setup lang="ts">
import type { InboxMessage } from '~/utils/inbox-thread'
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
        {{ t('dashboard.inbox.contact.title') }}
      </h3>
    </template>

    <dl class="space-y-3 text-sm">
      <div>
        <dt class="text-muted">{{ t('dashboard.inbox.contact.name') }}</dt>
        <dd class="mt-0.5 font-medium text-highlighted">{{ message.senderName }}</dd>
      </div>
      <div>
        <dt class="text-muted">{{ t('dashboard.inbox.contact.email') }}</dt>
        <dd class="mt-0.5 text-highlighted">{{ message.senderEmail }}</dd>
      </div>
      <div v-if="message.senderCompany">
        <dt class="text-muted">{{ t('dashboard.inbox.contact.company') }}</dt>
        <dd class="mt-0.5 text-highlighted">{{ message.senderCompany }}</dd>
      </div>
      <div v-if="message.senderWebsite">
        <dt class="text-muted">{{ t('dashboard.inbox.contact.website') }}</dt>
        <dd class="mt-0.5 text-highlighted">{{ message.senderWebsite }}</dd>
      </div>
    </dl>
  </UCard>
</template>
