<script setup lang="ts">
import { localeDefinitions } from '#locales'
import type { EditableNewsletterLink } from '~/components/dashboard/newsletter/LinkRow.vue'
import { dashboardCardUi } from '~/utils/dashboard-ui'
import {
  getNewsletterTemplateDefaults,
  getNextNewsletterSlot,
  renderNewsletterEmail,
  type NewsletterLocale,
  type NewsletterTemplate
} from '~~/shared/utils/newsletter-email'

type IssueStatus = 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'SENT'
type ScheduleOption = 'now' | 'weekly' | 'monthly' | 'custom'

const props = defineProps<{
  issueId: string
  template: NewsletterTemplate
  locale: NewsletterLocale
  audience: { locale: string; subscribed: number }[]
}>()

const emit = defineEmits<{
  close: []
  saved: [id: string]
}>()

const { t, locale: uiLocale } = useI18n()
const toast = useToast()
const siteUrl = String(useRuntimeConfig().public.siteUrl).replace(/\/$/, '')

const MAX_DIGEST_ITEMS = 12
const MAX_DESCRIPTION = 280

function createForm(template: NewsletterTemplate, locale: NewsletterLocale) {
  return {
    id: null as string | null,
    template,
    locale,
    subject: '',
    preheader: '',
    ...getNewsletterTemplateDefaults(template, locale),
    items: [] as EditableNewsletterLink[],
    ctaLabel: '',
    ctaUrl: '',
    status: 'DRAFT' as IssueStatus,
    scheduledAt: null as number | null,
    recipientCount: 0,
    sentCount: 0,
    failedCount: 0
  }
}

const form = reactive(createForm(props.template, props.locale))
const isLoading = ref(false)
const isSaving = ref(false)
const previewWidth = ref<'desktop' | 'mobile'>('desktop')
const isReadOnly = computed(() => form.status === 'SENDING' || form.status === 'SENT')
const isDigest = computed(() => form.template === 'WEEKLY' || form.template === 'MONTHLY')
const isRtl = computed(() => form.locale === 'fa')

const isTestOpen = ref(false)
const testEmail = ref('')
const isScheduleOpen = ref(false)
const scheduleOption = ref<ScheduleOption>('now')
const customDate = ref('')
const isDeleteOpen = ref(false)

const audienceCount = computed(
  () => props.audience.find((item) => item.locale === form.locale)?.subscribed ?? 0
)

const preview = computed(
  () =>
    renderNewsletterEmail(
      { ...form, subject: form.subject || t('dashboard.newsletter.composer.subject') },
      { siteUrl, unsubscribeUrl: '#', date: form.scheduledAt ?? undefined }
    ).html
)

function formatDate(value: number) {
  return new Intl.DateTimeFormat(uiLocale.value, { dateStyle: 'full', timeStyle: 'short' }).format(
    new Date(value)
  )
}

function toLocalInputValue(date: Date) {
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

const scheduleOptions = computed(() => {
  const weekly = getNextNewsletterSlot('WEEKLY')
  const monthly = getNextNewsletterSlot('MONTHLY')

  return [
    {
      value: 'now',
      label: t('dashboard.newsletter.composer.scheduleNow'),
      description: t('dashboard.newsletter.composer.scheduleNowHint')
    },
    {
      value: 'weekly',
      label: t('dashboard.newsletter.composer.scheduleWeekly'),
      description: formatDate(weekly.getTime())
    },
    {
      value: 'monthly',
      label: t('dashboard.newsletter.composer.scheduleMonthly'),
      description: formatDate(monthly.getTime())
    },
    { value: 'custom', label: t('dashboard.newsletter.composer.scheduleCustom') }
  ]
})

function resolveScheduleTime() {
  if (scheduleOption.value === 'weekly') return getNextNewsletterSlot('WEEKLY').getTime()
  if (scheduleOption.value === 'monthly') return getNextNewsletterSlot('MONTHLY').getTime()
  if (scheduleOption.value === 'custom' && customDate.value) {
    return new Date(customDate.value).getTime()
  }

  return Date.now()
}

function errorMessage(error: unknown) {
  const gqlError =
    error && typeof error === 'object'
      ? (error as { gqlErrors?: Array<{ message?: string }> }).gqlErrors?.[0]
      : undefined

  return gqlError?.message || t('dashboard.newsletter.composer.saveFailed')
}

async function load(id: string) {
  isLoading.value = true

  try {
    const { newsletterIssue: issue } = await GqlNewsletterIssue({ id })

    if (!issue) {
      emit('close')
      return
    }

    Object.assign(form, {
      ...issue,
      preheader: issue.preheader ?? '',
      ctaLabel: issue.ctaLabel ?? '',
      ctaUrl: issue.ctaUrl ?? '',
      items: issue.items.map((item) => ({
        title: item.title,
        url: item.url,
        description: item.description ?? '',
        meta: item.meta ?? ''
      }))
    })
  } catch (error) {
    toast.add({ color: 'error', title: errorMessage(error) })
  } finally {
    isLoading.value = false
  }
}

async function save(scheduledAt: number | null, successTitle: string) {
  isSaving.value = true

  try {
    const { saveNewsletterIssue: issue } = await GqlSaveNewsletterIssue({
      input: {
        id: form.id,
        template: form.template,
        locale: form.locale,
        subject: form.subject,
        preheader: form.preheader,
        heading: form.heading,
        intro: form.intro,
        items: form.items,
        ctaLabel: form.ctaLabel,
        ctaUrl: form.ctaUrl,
        outro: form.outro,
        scheduledAt
      }
    })

    if (!issue) return false

    form.id = issue.id
    form.status = issue.status as IssueStatus
    form.scheduledAt = issue.scheduledAt ?? null
    emit('saved', issue.id)
    toast.add({ color: 'success', icon: 'i-lucide-check', title: successTitle })

    return true
  } catch (error) {
    toast.add({ color: 'error', icon: 'i-lucide-circle-alert', title: errorMessage(error) })
    return false
  } finally {
    isSaving.value = false
  }
}

async function confirmSchedule() {
  const scheduledAt = resolveScheduleTime()
  const saved = await save(
    scheduledAt,
    t('dashboard.newsletter.composer.scheduled', { date: formatDate(scheduledAt) })
  )

  if (saved) isScheduleOpen.value = false
}

async function sendTest() {
  const saved =
    isReadOnly.value ||
    (await save(
      form.status === 'SCHEDULED' ? form.scheduledAt : null,
      t('dashboard.newsletter.composer.saved')
    ))

  if (!saved || !form.id) return

  try {
    await GqlSendNewsletterTest({ id: form.id, email: testEmail.value.trim() || null })
    isTestOpen.value = false
    toast.add({
      color: 'success',
      icon: 'i-lucide-send',
      title: t('dashboard.newsletter.composer.testSent')
    })
  } catch (error) {
    toast.add({ color: 'error', icon: 'i-lucide-circle-alert', title: errorMessage(error) })
  }
}

async function deleteIssue() {
  if (!form.id) {
    emit('close')
    return
  }

  try {
    await GqlDeleteNewsletterIssue({ id: form.id })
    toast.add({ color: 'success', title: t('dashboard.newsletter.composer.deleted') })
    emit('close')
  } catch (error) {
    toast.add({ color: 'error', icon: 'i-lucide-circle-alert', title: errorMessage(error) })
  } finally {
    isDeleteOpen.value = false
  }
}

function addLink() {
  form.items.push({ title: '', url: '', description: '', meta: '' })
}

function removeLink(index: number) {
  form.items.splice(index, 1)
}

function truncate(value: string) {
  return value.length > MAX_DESCRIPTION
    ? `${value.slice(0, MAX_DESCRIPTION - 1).trimEnd()}…`
    : value
}

// Lazy chunk: a build-time index of titles and dates, not the full content JSON.
async function fillRecentPosts(silent = false) {
  const { default: digest } = await import('~~/.velite/digest.json')
  const days = form.template === 'MONTHLY' ? 31 : 7
  const since = Date.now() - days * 86_400_000

  const posts = digest
    .filter(
      (post) => post.path.startsWith(`/${form.locale}/`) && new Date(post.date).getTime() >= since
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, MAX_DIGEST_ITEMS)

  if (!posts.length) {
    if (!silent)
      toast.add({ color: 'neutral', title: t('dashboard.newsletter.composer.fillEmpty') })
    return
  }

  form.items = posts.map((post) => ({
    title: post.title,
    url: `${siteUrl}${post.path}`,
    description: truncate(post.description),
    meta: t(`nav.${post.type}`, {}, { locale: form.locale })
  }))

  if (!silent) {
    toast.add({
      color: 'success',
      title: t('dashboard.newsletter.composer.fillDone', {
        count: formatLocalizedNumber(posts.length, uiLocale.value)
      })
    })
  }
}

watch(
  () => props.issueId,
  async (id) => {
    if (id === 'new') {
      Object.assign(form, createForm(props.template, props.locale))
      if (isDigest.value) await fillRecentPosts(true)
      return
    }

    if (id !== form.id) await load(id)
  },
  { immediate: true }
)

watch(isScheduleOpen, (open) => {
  if (!open) return

  scheduleOption.value = 'now'
  customDate.value = toLocalInputValue(getNextNewsletterSlot('WEEKLY'))
})
</script>

<template>
  <div class="flex min-h-0 flex-col gap-4">
    <div class="flex flex-wrap items-center gap-2">
      <UButton
        color="neutral"
        variant="ghost"
        icon="i-lucide-arrow-left"
        class="rtl:[&_svg]:rotate-180"
        @click="emit('close')"
      >
        {{ t('dashboard.newsletter.composer.back') }}
      </UButton>

      <UBadge color="neutral" variant="soft">
        {{ t(`dashboard.newsletter.templates.${form.template}.label`) }}
      </UBadge>
      <UBadge color="neutral" variant="outline">
        {{ localeDefinitions.find((item) => item.code === form.locale)?.name }}
      </UBadge>
      <UBadge v-if="form.status === 'SCHEDULED' && form.scheduledAt" color="info" variant="soft">
        {{ t('dashboard.newsletter.issues.scheduledFor', { date: formatDate(form.scheduledAt) }) }}
      </UBadge>

      <div v-if="!isReadOnly" class="ms-auto flex flex-wrap items-center gap-2">
        <UButton
          v-if="form.id"
          color="error"
          variant="ghost"
          icon="i-lucide-trash-2"
          :aria-label="t('dashboard.newsletter.composer.delete')"
          @click="isDeleteOpen = true"
        />
        <UButton
          color="neutral"
          variant="outline"
          icon="i-lucide-send"
          :disabled="isSaving"
          @click="isTestOpen = true"
        >
          {{ t('dashboard.newsletter.composer.sendTest') }}
        </UButton>
        <UButton
          v-if="form.status === 'SCHEDULED'"
          color="neutral"
          variant="outline"
          :loading="isSaving"
          @click="save(null, t('dashboard.newsletter.composer.saved'))"
        >
          {{ t('dashboard.newsletter.composer.unschedule') }}
        </UButton>
        <UButton
          v-else
          color="neutral"
          variant="outline"
          icon="i-lucide-save"
          :loading="isSaving"
          @click="save(null, t('dashboard.newsletter.composer.saved'))"
        >
          {{ t('dashboard.newsletter.composer.saveDraft') }}
        </UButton>
        <UButton icon="i-lucide-calendar-clock" :disabled="isSaving" @click="isScheduleOpen = true">
          {{ t('dashboard.newsletter.composer.schedule') }}
        </UButton>
      </div>

      <UButton
        v-else
        class="ms-auto"
        color="neutral"
        variant="outline"
        icon="i-lucide-send"
        @click="isTestOpen = true"
      >
        {{ t('dashboard.newsletter.composer.sendTest') }}
      </UButton>
    </div>

    <UAlert
      v-if="isReadOnly"
      color="info"
      variant="soft"
      icon="i-lucide-mail-check"
      :title="t('dashboard.newsletter.composer.readOnly')"
      :description="
        t('dashboard.newsletter.issues.delivered', {
          sent: formatLocalizedNumber(form.sentCount, uiLocale),
          total: formatLocalizedNumber(form.recipientCount, uiLocale)
        })
      "
    />

    <div class="grid min-h-0 flex-1 gap-4 lg:grid-cols-2">
      <UCard
        variant="outline"
        :ui="{ ...dashboardCardUi, root: `${dashboardCardUi.root} min-h-0 overflow-y-auto` }"
      >
        <div v-if="isLoading" class="space-y-4">
          <USkeleton v-for="index in 5" :key="index" class="h-10 w-full" />
        </div>

        <fieldset v-else :disabled="isReadOnly" class="space-y-5" :dir="isRtl ? 'rtl' : 'ltr'">
          <UFormField :label="t('dashboard.newsletter.composer.subject')" required>
            <UInput v-model="form.subject" class="w-full" maxlength="150" />
          </UFormField>

          <UFormField
            :label="t('dashboard.newsletter.composer.preheader')"
            :help="t('dashboard.newsletter.composer.preheaderHint')"
          >
            <UInput v-model="form.preheader" class="w-full" maxlength="200" />
          </UFormField>

          <UFormField :label="t('dashboard.newsletter.composer.heading')">
            <UInput v-model="form.heading" class="w-full" maxlength="200" />
          </UFormField>

          <UFormField
            :label="t('dashboard.newsletter.composer.intro')"
            :help="t('dashboard.newsletter.composer.introHint')"
            required
          >
            <UTextarea
              v-model="form.intro"
              class="w-full"
              autoresize
              :rows="form.template === 'LETTER' ? 10 : 4"
            />
          </UFormField>

          <section v-if="form.template === 'ANNOUNCEMENT' || form.ctaLabel" class="space-y-3">
            <h3 class="text-sm font-semibold text-highlighted">
              {{ t('dashboard.newsletter.composer.cta') }}
            </h3>
            <div class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
              <UInput
                v-model="form.ctaLabel"
                :placeholder="t('dashboard.newsletter.composer.ctaLabel')"
                maxlength="80"
              />
              <UInput
                v-model="form.ctaUrl"
                type="url"
                dir="ltr"
                placeholder="https://"
                :aria-label="t('dashboard.newsletter.composer.ctaUrl')"
              />
            </div>
          </section>

          <section class="space-y-3">
            <div class="flex items-center justify-between gap-2">
              <h3 class="text-sm font-semibold text-highlighted">
                {{ t('dashboard.newsletter.composer.links') }}
              </h3>
              <UButton
                v-if="isDigest"
                size="xs"
                color="neutral"
                variant="ghost"
                icon="i-lucide-sparkles"
                @click="fillRecentPosts()"
              >
                {{ t('dashboard.newsletter.composer.fillRecent') }}
              </UButton>
            </div>

            <DashboardNewsletterLinkRow
              v-for="(_, index) in form.items"
              :key="index"
              v-model="form.items[index]!"
              @remove="removeLink(index)"
            />

            <UButton
              color="neutral"
              variant="soft"
              icon="i-lucide-plus"
              size="sm"
              :disabled="form.items.length >= 20"
              @click="addLink"
            >
              {{ t('dashboard.newsletter.composer.addLink') }}
            </UButton>
          </section>

          <UFormField :label="t('dashboard.newsletter.composer.outro')">
            <UTextarea v-model="form.outro" class="w-full" autoresize :rows="2" />
          </UFormField>
        </fieldset>
      </UCard>

      <UCard
        variant="outline"
        :ui="{
          ...dashboardCardUi,
          root: `${dashboardCardUi.root} flex min-h-[32rem] flex-col overflow-hidden`,
          body: 'flex min-h-0 flex-1 justify-center overflow-hidden bg-muted/30 p-0'
        }"
      >
        <template #header>
          <div class="flex items-center justify-between gap-2">
            <h3 class="text-sm font-semibold text-highlighted">
              {{ t('dashboard.newsletter.composer.preview') }}
            </h3>
            <UFieldGroup size="xs">
              <UButton
                icon="i-lucide-monitor"
                :color="previewWidth === 'desktop' ? 'primary' : 'neutral'"
                variant="soft"
                :aria-label="t('dashboard.newsletter.composer.desktop')"
                @click="previewWidth = 'desktop'"
              />
              <UButton
                icon="i-lucide-smartphone"
                :color="previewWidth === 'mobile' ? 'primary' : 'neutral'"
                variant="soft"
                :aria-label="t('dashboard.newsletter.composer.mobile')"
                @click="previewWidth = 'mobile'"
              />
            </UFieldGroup>
          </div>
        </template>

        <iframe
          :srcdoc="preview"
          sandbox=""
          :title="t('dashboard.newsletter.composer.preview')"
          class="h-full min-h-[32rem] border-0 bg-white transition-[width]"
          :class="previewWidth === 'mobile' ? 'w-[375px]' : 'w-full'"
        />
      </UCard>
    </div>

    <UModal v-model:open="isTestOpen" :title="t('dashboard.newsletter.composer.sendTest')">
      <template #body>
        <form class="space-y-4" @submit.prevent="sendTest">
          <UFormField
            :label="t('dashboard.newsletter.composer.testEmail')"
            :help="t('dashboard.newsletter.composer.testEmailHint')"
          >
            <UInput
              v-model="testEmail"
              class="w-full"
              type="email"
              dir="ltr"
              autocomplete="email"
            />
          </UFormField>
          <div class="flex justify-end gap-2">
            <UButton color="neutral" variant="ghost" @click="isTestOpen = false">
              {{ t('dashboard.newsletter.composer.cancel') }}
            </UButton>
            <UButton type="submit" icon="i-lucide-send" :loading="isSaving">
              {{ t('dashboard.newsletter.composer.sendTest') }}
            </UButton>
          </div>
        </form>
      </template>
    </UModal>

    <UModal v-model:open="isScheduleOpen" :title="t('dashboard.newsletter.composer.scheduleTitle')">
      <template #body>
        <div class="space-y-4">
          <p class="text-sm text-muted">
            {{
              t('dashboard.newsletter.composer.scheduleAudience', {
                count: formatLocalizedNumber(audienceCount, uiLocale),
                language: localeDefinitions.find((item) => item.code === form.locale)?.name
              })
            }}
          </p>

          <URadioGroup v-model="scheduleOption" variant="table" :items="scheduleOptions" />

          <UInput
            v-if="scheduleOption === 'custom'"
            v-model="customDate"
            type="datetime-local"
            class="w-full"
            dir="ltr"
            :min="toLocalInputValue(new Date())"
          />

          <div class="flex justify-end gap-2">
            <UButton color="neutral" variant="ghost" @click="isScheduleOpen = false">
              {{ t('dashboard.newsletter.composer.cancel') }}
            </UButton>
            <UButton icon="i-lucide-calendar-check" :loading="isSaving" @click="confirmSchedule">
              {{ t('dashboard.newsletter.composer.scheduleConfirm') }}
            </UButton>
          </div>
        </div>
      </template>
    </UModal>

    <DashboardInboxConfirm
      v-model:open="isDeleteOpen"
      :title="t('dashboard.newsletter.composer.delete')"
      :description="t('dashboard.newsletter.composer.deleteConfirm')"
      :confirm-label="t('dashboard.newsletter.composer.delete')"
      destructive
      @confirm="deleteIssue"
      @cancel="isDeleteOpen = false"
    />
  </div>
</template>
