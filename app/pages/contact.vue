<script setup lang="ts">
import { z } from 'zod'

const { locale, t } = useI18n()
const toast = useToast()

const path = computed(() => `/${locale.value}/contact`)
const legacyPath = computed(() => `/${locale.value}/pages/contact`)
const page = computed(() => getPage(path.value) || getPage(legacyPath.value))

if (!page.value || page.value.draft) {
  throw createError({ statusCode: 404, statusMessage: 'Contact page not found', fatal: true })
}

useMohetiosSeo({
  title: () => page.value?.title,
  description: () => page.value?.description,
  path: () => toPublicPath(page.value?.path || path.value),
  image: () => page.value?.thumbnail,
  locale: () => locale.value,
  type: 'website'
})

const contactTopics = computed(() => [
  {
    label: t('contact.topics.project'),
    value: 'PROJECT'
  },
  {
    label: t('contact.topics.consulting'),
    value: 'CONSULTING'
  },
  {
    label: t('contact.topics.collaboration'),
    value: 'COLLABORATION'
  },
  {
    label: t('contact.topics.writing'),
    value: 'WRITING'
  },
  {
    label: t('contact.topics.other'),
    value: 'OTHER'
  }
])

const schema = z.object({
  name: z.string().min(2, t('contact.validation.name')),
  email: z.email(t('contact.validation.email')),
  topic: z.string().min(1, t('contact.validation.topic')),
  message: z.string().min(20, t('contact.validation.message')),
  website: z.string().optional(),
  company: z.string().optional(),

  // Honeypot field. Keep empty.
  subject: z.string().optional()
})

type ContactFormState = z.output<typeof schema>
type TurnstileWidget = {
  reset: () => void
}

const state = reactive<ContactFormState>({
  name: '',
  email: '',
  topic: '',
  message: '',
  website: '',
  company: '',
  subject: ''
})

const isSubmitting = ref(false)
const isSubmitted = ref(false)
const turnstile = ref<TurnstileWidget | null>(null)
const turnstileToken = ref('')

const contactChannels = computed(() => [
  {
    title: t('contact.channels.email.title'),
    description: 'hi@mohetios.dev',
    icon: 'i-lucide-mail'
  },
  {
    title: t('contact.channels.work.title'),
    description: t('contact.channels.work.description'),
    icon: 'i-lucide-briefcase-business'
  },
  {
    title: t('contact.channels.response.title'),
    description: t('contact.channels.response.description'),
    icon: 'i-lucide-clock-3'
  }
])

const focusAreas = computed(() => [
  t('contact.focus.productEngineering'),
  t('contact.focus.frontendArchitecture'),
  t('contact.focus.aiWorkflows'),
  t('contact.focus.dashboards'),
  t('contact.focus.technicalWriting')
])

function getContactErrorMessage(error: unknown) {
  if (!error || typeof error !== 'object') {
    return t('contact.error.description')
  }

  const currentError = error as {
    data?: { message?: string; statusMessage?: string }
    message?: string
    statusMessage?: string
  }
  const message =
    currentError.data?.message ||
    currentError.data?.statusMessage ||
    currentError.statusMessage ||
    currentError.message

  if (!message) {
    return t('contact.error.description')
  }

  if (message.includes('no such table: inbox_messages')) {
    return t('contact.error.migration')
  }

  return message
}

async function createContactMessage(input: {
  name: string
  email: string
  topic: string
  message: string
  turnstileToken: string
  website?: string | null
  company?: string | null
}) {
  try {
    const data = await GqlCreateContactMessage({ input })

    return data.createContactMessage
  } catch (error) {
    const gqlError =
      error && typeof error === 'object'
        ? (error as { response?: { errors?: Array<{ message?: string }> } }).response?.errors?.[0]
        : undefined

    throw new Error(
      gqlError?.message ||
        (error instanceof Error ? error.message : 'Contact message request failed'),
      { cause: error }
    )
  }
}

async function onSubmit() {
  if (state.subject) return

  if (!turnstileToken.value) {
    toast.add({
      color: 'error',
      icon: 'i-lucide-shield-alert',
      title: t('contact.error.verificationTitle'),
      description: t('contact.error.verificationDescription')
    })

    return
  }

  isSubmitting.value = true

  try {
    await createContactMessage({
      name: state.name,
      email: state.email,
      topic: state.topic,
      message: state.message,
      turnstileToken: turnstileToken.value,
      website: state.website || null,
      company: state.company || null
    })

    isSubmitted.value = true
    state.name = ''
    state.email = ''
    state.topic = ''
    state.message = ''
    state.website = ''
    state.company = ''
    turnstileToken.value = ''
    turnstile.value?.reset()
  } catch (error) {
    if (import.meta.dev) {
      console.error('[contact:submit-error]', error)
    }

    toast.add({
      color: 'error',
      icon: 'i-lucide-circle-alert',
      title: t('contact.error.title'),
      description: getContactErrorMessage(error)
    })

    turnstileToken.value = ''
    turnstile.value?.reset()
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <UPage v-if="page">
    <UPageHeader :title="page.title" :description="page.description">
      <template #headline>
        <UBadge color="neutral" variant="outline">
          {{ t('content.contact.eyebrow') }}
        </UBadge>
      </template>
    </UPageHeader>

    <UPageBody>
      <section class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div class="space-y-6">
          <UCard
            :ui="{
              root: 'rounded-2xl ring-1 ring-default',
              body: 'p-6 sm:p-8'
            }"
          >
            <ContentHtml
              :html="page.content"
              class="prose prose-lg mb-8 border-b border-default pb-8"
            />

            <div v-if="isSubmitted" class="space-y-4">
              <div
                class="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary"
              >
                <UIcon name="i-lucide-check" class="size-6" />
              </div>

              <div class="space-y-2">
                <h2 class="text-xl font-semibold tracking-tight text-highlighted">
                  {{ t('contact.success.title') }}
                </h2>

                <p class="text-sm leading-7 text-muted">
                  {{ t('contact.success.description') }}
                </p>
              </div>

              <UButton variant="soft" icon="i-lucide-send" @click="isSubmitted = false">
                {{ t('contact.success.sendAnother') }}
              </UButton>
            </div>

            <UForm v-else :schema="schema" :state="state" class="space-y-6" @submit="onSubmit">
              <div class="grid gap-4 sm:grid-cols-2">
                <UFormField :label="t('contact.form.name')" name="name" required class="w-full">
                  <UInput
                    v-model="state.name"
                    class="w-full"
                    size="md"
                    :placeholder="t('contact.form.namePlaceholder')"
                    autocomplete="name"
                  />
                </UFormField>

                <UFormField :label="t('contact.form.email')" name="email" required class="w-full">
                  <UInput
                    v-model="state.email"
                    class="w-full"
                    size="md"
                    type="email"
                    :placeholder="t('contact.form.emailPlaceholder')"
                    autocomplete="email"
                  />
                </UFormField>
              </div>

              <UFormField :label="t('contact.form.topic')" name="topic" required class="w-full">
                <USelectMenu
                  v-model="state.topic"
                  class="w-full"
                  size="md"
                  value-key="value"
                  :items="contactTopics"
                  :placeholder="t('contact.form.topicPlaceholder')"
                />
              </UFormField>

              <UFormField :label="t('contact.form.message')" name="message" required class="w-full">
                <UTextarea
                  v-model="state.message"
                  class="w-full"
                  :rows="7"
                  size="md"
                  autoresize
                  :maxrows="10"
                  :placeholder="t('contact.form.messagePlaceholder')"
                />
              </UFormField>

              <UAccordion
                :items="[
                  {
                    label: t('contact.form.optionalContext'),
                    icon: 'i-lucide-plus',
                    slot: 'optional'
                  }
                ]"
                variant="soft"
                size="sm"
              >
                <template #optional>
                  <div class="grid gap-4 pt-3 sm:grid-cols-2">
                    <UFormField :label="t('contact.form.company')" name="company" class="w-full">
                      <UInput
                        v-model="state.company"
                        class="w-full"
                        size="md"
                        :placeholder="t('contact.form.companyPlaceholder')"
                        autocomplete="organization"
                      />
                    </UFormField>

                    <UFormField :label="t('contact.form.website')" name="website" class="w-full">
                      <UInput
                        v-model="state.website"
                        class="w-full"
                        size="md"
                        :placeholder="t('contact.form.websitePlaceholder')"
                        autocomplete="url"
                      />
                    </UFormField>
                  </div>
                </template>
              </UAccordion>

              <!-- Honeypot: hidden from users, visible to simple bots -->
              <div class="hidden" aria-hidden="true">
                <UFormField label="Subject" name="subject">
                  <UInput v-model="state.subject" tabindex="-1" autocomplete="off" />
                </UFormField>
              </div>

              <div class="space-y-3 border-t border-default pt-6">
                <div
                  class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
                >
                  <div
                    class="flex min-h-16 items-center [&_iframe]:block [&>span]:block [&>span]:min-h-0 [&>span]:leading-none"
                  >
                    <NuxtTurnstile
                      ref="turnstile"
                      v-model="turnstileToken"
                      element="span"
                      :options="{
                        action: 'contact_message',
                        theme: 'auto',
                        language: locale,
                        appearance: 'interaction-only'
                      }"
                    />
                  </div>

                  <UButton
                    type="submit"
                    size="md"
                    icon="i-lucide-send"
                    :loading="isSubmitting"
                    :disabled="!turnstileToken || isSubmitting"
                    class="w-full shrink-0 px-5 sm:w-auto sm:min-w-36"
                  >
                    {{ t('contact.form.submit') }}
                  </UButton>
                </div>

                <p class="text-xs leading-6 text-dimmed">
                  {{ t('contact.form.privacyNote') }}
                </p>
              </div>
            </UForm>
          </UCard>
        </div>

        <aside class="space-y-5">
          <UCard
            :ui="{
              root: 'rounded-2xl bg-muted/30 ring-1 ring-default',
              body: 'p-6'
            }"
          >
            <div class="space-y-4">
              <div>
                <p
                  class="text-xs font-medium tracking-[0.2em] text-primary uppercase"
                >
                  {{ t('contact.sidebar.label') }}
                </p>

                <h2 class="mt-2 text-lg font-semibold tracking-tight text-highlighted">
                  {{ t('contact.sidebar.title') }}
                </h2>

                <p class="mt-2 text-sm leading-7 text-muted">
                  {{ t('contact.sidebar.description') }}
                </p>
              </div>

              <div class="flex flex-wrap gap-2">
                <UBadge
                  v-for="item in focusAreas"
                  :key="item"
                  variant="soft"
                  color="neutral"
                  class="rounded-full"
                >
                  {{ item }}
                </UBadge>
              </div>
            </div>
          </UCard>

          <UCard
            v-for="channel in contactChannels"
            :key="channel.title"
            :ui="{
              root: 'rounded-2xl ring-1 ring-default',
              body: 'p-5'
            }"
          >
            <div class="flex gap-4">
              <div
                class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-toned"
              >
                <UIcon :name="channel.icon" class="size-5" />
              </div>

              <div>
                <h3 class="font-medium text-highlighted">
                  {{ channel.title }}
                </h3>

                <p class="mt-1 text-sm leading-6 text-muted">
                  {{ channel.description }}
                </p>
              </div>
            </div>
          </UCard>
        </aside>
      </section>
    </UPageBody>
  </UPage>
</template>
