<script setup lang="ts">
import { localeDefinitions } from '#locales'
import { dashboardCardUi } from '~/utils/dashboard-ui'
import {
  NEWSLETTER_TEMPLATES,
  type NewsletterLocale,
  type NewsletterTemplate
} from '~~/shared/utils/newsletter-email'

type IssueRow = {
  id: string
  template: NewsletterTemplate
  locale: string
  subject: string
  status: 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'SENT'
  scheduledAt?: number | null
  sentAt?: number | null
  updatedAt: number
  recipientCount: number
  sentCount: number
  failedCount: number
}

defineProps<{
  issues: IssueRow[]
  loading: boolean
}>()

const emit = defineEmits<{
  open: [id: string]
  create: [template: NewsletterTemplate, locale: NewsletterLocale]
}>()

const { t, locale } = useI18n()

const isPickerOpen = ref(false)
const pickedLocale = ref<NewsletterLocale>(locale.value === 'en' ? 'en' : 'fa')

const templateIcons: Record<NewsletterTemplate, string> = {
  WEEKLY: 'i-lucide-calendar-days',
  MONTHLY: 'i-lucide-calendar-range',
  LETTER: 'i-lucide-feather',
  ANNOUNCEMENT: 'i-lucide-megaphone'
}

const statusColors = {
  DRAFT: 'neutral',
  SCHEDULED: 'info',
  SENDING: 'warning',
  SENT: 'success'
} as const

const localeItems = localeDefinitions.map(({ code, name }) => ({ label: name, value: code }))

function localeName(code: string) {
  return localeDefinitions.find((definition) => definition.code === code)?.name ?? code
}

function formatDate(value: number) {
  return new Intl.DateTimeFormat(locale.value, { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value)
  )
}

function n(value: number) {
  return formatLocalizedNumber(value, locale.value)
}

function issueDate(issue: IssueRow) {
  if (issue.status === 'SENT' && issue.sentAt) {
    return t('dashboard.newsletter.issues.sentOn', { date: formatDate(issue.sentAt) })
  }

  if (issue.status === 'SCHEDULED' && issue.scheduledAt) {
    return t('dashboard.newsletter.issues.scheduledFor', { date: formatDate(issue.scheduledAt) })
  }

  return t('dashboard.newsletter.issues.editedOn', { date: formatDate(issue.updatedAt) })
}

function pick(template: NewsletterTemplate) {
  isPickerOpen.value = false
  emit('create', template, pickedLocale.value)
}
</script>

<template>
  <UCard
    variant="outline"
    :ui="{ ...dashboardCardUi, body: 'p-0' }"
    class="min-h-0 overflow-hidden"
  >
    <template #header>
      <div class="flex items-center justify-between gap-3">
        <h2 class="text-base font-semibold text-highlighted">
          {{ t('dashboard.newsletter.tabs.issues') }}
        </h2>

        <UButton icon="i-lucide-plus" @click="isPickerOpen = true">
          {{ t('dashboard.newsletter.issues.new') }}
        </UButton>
      </div>
    </template>

    <div v-if="loading && !issues.length" class="space-y-3 p-4 sm:p-5">
      <USkeleton v-for="index in 3" :key="index" class="h-16 w-full rounded-xl" />
    </div>

    <DashboardWorkspaceEmpty
      v-else-if="!issues.length"
      icon="i-lucide-mail"
      :title="t('dashboard.newsletter.issues.emptyTitle')"
      :description="t('dashboard.newsletter.issues.empty')"
    />

    <ul v-else class="divide-y divide-default">
      <li v-for="issue in issues" :key="issue.id">
        <button
          type="button"
          class="flex w-full items-center gap-4 px-4 py-3.5 text-start transition-colors hover:bg-elevated/60 sm:px-5"
          @click="emit('open', issue.id)"
        >
          <div
            class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
          >
            <UIcon :name="templateIcons[issue.template]" class="size-5" />
          </div>

          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-highlighted">
              {{ issue.subject }}
            </p>
            <p class="mt-0.5 truncate text-xs text-muted">
              {{ t(`dashboard.newsletter.templates.${issue.template}.label`) }} ·
              {{ localeName(issue.locale) }} · {{ issueDate(issue) }}
            </p>
          </div>

          <div class="hidden shrink-0 text-end text-xs text-muted sm:block">
            <p v-if="issue.status === 'SENDING' || issue.status === 'SENT'">
              {{
                t('dashboard.newsletter.issues.delivered', {
                  sent: n(issue.sentCount),
                  total: n(issue.recipientCount)
                })
              }}
            </p>
            <p v-if="issue.failedCount" class="text-error">
              {{ t('dashboard.newsletter.issues.failed', { count: n(issue.failedCount) }) }}
            </p>
          </div>

          <UBadge :color="statusColors[issue.status]" variant="soft" class="shrink-0">
            {{ t(`dashboard.newsletter.issues.status.${issue.status.toLowerCase()}`) }}
          </UBadge>
        </button>
      </li>
    </ul>
  </UCard>

  <UModal v-model:open="isPickerOpen" :title="t('dashboard.newsletter.templates.pick')">
    <template #body>
      <div class="space-y-4">
        <UFormField :label="t('dashboard.newsletter.templates.language')">
          <URadioGroup
            v-model="pickedLocale"
            orientation="horizontal"
            variant="table"
            :items="localeItems"
          />
        </UFormField>

        <div class="grid gap-3 sm:grid-cols-2">
          <button
            v-for="template in NEWSLETTER_TEMPLATES"
            :key="template"
            type="button"
            class="rounded-xl p-4 text-start ring-1 ring-default transition hover:bg-elevated/60 hover:ring-primary/60 focus-visible:outline-2 focus-visible:outline-primary"
            @click="pick(template)"
          >
            <UIcon :name="templateIcons[template]" class="size-5 text-primary" />
            <p class="mt-3 text-sm font-semibold text-highlighted">
              {{ t(`dashboard.newsletter.templates.${template}.label`) }}
            </p>
            <p class="mt-1 text-xs leading-5 text-muted">
              {{ t(`dashboard.newsletter.templates.${template}.description`) }}
            </p>
          </button>
        </div>
      </div>
    </template>
  </UModal>
</template>
