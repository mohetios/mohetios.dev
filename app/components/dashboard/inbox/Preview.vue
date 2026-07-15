<script setup lang="ts">
import type { DashboardHome } from '~/composables/useDashboardHome'

defineProps<{
  items: DashboardHome['inboxPreview']
  loading?: boolean
}>()

const { t, locale, locales } = useI18n()
const localePath = useLocalePath()
const currentLanguage = computed(() => {
  const language = locales.value.find((item) => item.code === locale.value)?.language

  return typeof language === 'string' ? language : locale.value
})

const timeFormatter = computed(
  () =>
    new Intl.RelativeTimeFormat(currentLanguage.value, {
      numeric: 'auto'
    })
)

function formatRelativeTime(timestamp: number) {
  const diffMs = timestamp - Date.now()
  const diffMinutes = Math.round(diffMs / (1000 * 60))

  if (Math.abs(diffMinutes) < 60) {
    return timeFormatter.value.format(diffMinutes, 'minute')
  }

  const diffHours = Math.round(diffMinutes / 60)

  if (Math.abs(diffHours) < 24) {
    return timeFormatter.value.format(diffHours, 'hour')
  }

  const diffDays = Math.round(diffHours / 24)
  return timeFormatter.value.format(diffDays, 'day')
}

function sourceLabel(source: string) {
  if (source === 'contact_form') {
    return t('dashboard.home.inboxPreview.sourceContactForm')
  }

  if (source === 'email') {
    return t('dashboard.home.inboxPreview.sourceEmail')
  }

  return source
}

function statusBadge(status: string) {
  if (status === 'new' || status === 'open') {
    return {
      label: t('dashboard.home.inboxPreview.needsReply'),
      color: 'primary' as const
    }
  }

  if (status === 'replied') {
    return {
      label: t('dashboard.home.inboxPreview.replied'),
      color: 'success' as const
    }
  }

  return null
}

function kindBadge(kind: string) {
  if (kind === 'lead' || kind === 'collaboration') {
    return {
      label: t('dashboard.home.inboxPreview.lead'),
      color: 'success' as const
    }
  }

  return null
}
</script>

<template>
  <DashboardSection
    :title="t('dashboard.overview.inboxPreview')"
    to="/dashboard/inbox"
    :link-label="t('dashboard.overview.viewAll')"
    class="h-full"
  >
    <div v-if="loading" class="space-y-3">
      <USkeleton v-for="index in 4" :key="index" class="h-16 w-full" />
    </div>

    <p v-else-if="!items.length" class="text-sm text-muted">
      {{ t('dashboard.home.inboxPreview.empty') }}
    </p>

    <ul v-else class="divide-y divide-default">
      <li v-for="item in items" :key="item.id" class="py-3 first:pt-0 last:pb-0">
        <NuxtLink
          :to="{ path: localePath('/dashboard/inbox'), query: { message: item.id } }"
          class="flex gap-3 rounded-lg transition-colors hover:bg-muted/30"
        >
          <div class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted/60">
            <UIcon
              :name="item.source === 'email' ? 'i-lucide-mail' : 'i-lucide-user-round'"
              class="size-4 text-muted"
            />
          </div>

          <div class="min-w-0 flex-1">
            <div class="flex items-start justify-between gap-2">
              <p class="truncate text-sm font-medium text-highlighted">
                {{ item.subject }}
              </p>
              <span class="shrink-0 text-xs text-muted">
                {{ formatRelativeTime(item.createdAt) }}
              </span>
            </div>

            <p class="mt-0.5 text-xs text-muted">
              {{ sourceLabel(item.source) }} · {{ item.senderName }}
            </p>

            <p class="mt-1 line-clamp-2 text-sm text-muted">
              {{ item.preview }}
            </p>

            <div class="mt-2 flex flex-wrap gap-1.5">
              <UBadge
                v-if="statusBadge(item.status)"
                :color="statusBadge(item.status)!.color"
                variant="soft"
                size="xs"
                class="rounded-full"
              >
                {{ statusBadge(item.status)!.label }}
              </UBadge>
              <UBadge
                v-if="kindBadge(item.kind)"
                :color="kindBadge(item.kind)!.color"
                variant="soft"
                size="xs"
                class="rounded-full"
              >
                {{ kindBadge(item.kind)!.label }}
              </UBadge>
            </div>
          </div>
        </NuxtLink>
      </li>
    </ul>
  </DashboardSection>
</template>
