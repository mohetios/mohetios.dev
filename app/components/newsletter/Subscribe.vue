<script setup lang="ts">
import { z } from 'zod'

type Props = {
  source?: string
  plain?: boolean
  sectionTitle?: boolean
  title?: string
  description?: string
}

const props = withDefaults(defineProps<Props>(), {
  source: 'content_footer',
  plain: false,
  sectionTitle: false,
  title: undefined,
  description: undefined
})

const { locale, t } = useI18n()

type TurnstileWidget = {
  reset: () => void
}

type SubmitState = 'idle' | 'success' | 'already_subscribed' | 'pending' | 'error'

const email = ref('')
const turnstile = ref<TurnstileWidget | null>(null)
const turnstileToken = ref('')
const isSubmitting = ref(false)
const submitState = ref<SubmitState>('idle')
const errorMessage = ref('')

const consentText = computed(() => t('newsletter.consent'))

const schema = computed(() =>
  z.object({
    email: z.email(t('newsletter.validation.email'))
  })
)

const resolvedTitle = computed(() => props.title || t('newsletter.title'))
const resolvedDescription = computed(() => props.description || t('newsletter.description'))

const titleClass = computed(() =>
  props.sectionTitle
    ? 'text-3xl font-semibold tracking-tight text-balance leading-snug text-highlighted'
    : 'text-base font-semibold tracking-tight leading-7 text-pretty text-highlighted'
)

const statusMessage = computed(() => {
  switch (submitState.value) {
    case 'success':
      return t('newsletter.success')
    case 'already_subscribed':
      return t('newsletter.alreadySubscribed')
    case 'pending':
      return t('newsletter.pending')
    case 'error':
      return errorMessage.value || t('newsletter.error')
    default:
      return ''
  }
})

const isComplete = computed(() =>
  ['success', 'already_subscribed', 'pending'].includes(submitState.value)
)

function waitForTurnstileToken(timeoutMs = 10000) {
  if (turnstileToken.value) {
    return Promise.resolve(turnstileToken.value)
  }

  return new Promise<string | null>((resolve) => {
    const stop = watch(turnstileToken, (token) => {
      if (!token) return

      stop()
      clearTimeout(timer)
      resolve(token)
    })

    const timer = setTimeout(() => {
      stop()
      resolve(null)
    }, timeoutMs)
  })
}

async function onSubmit() {
  errorMessage.value = ''
  submitState.value = 'idle'

  const parsed = schema.value.safeParse({
    email: email.value.trim()
  })

  if (!parsed.success) {
    submitState.value = 'error'
    errorMessage.value = parsed.error.issues[0]?.message || t('newsletter.error')
    return
  }

  isSubmitting.value = true

  const token = await waitForTurnstileToken()

  if (!token) {
    submitState.value = 'error'
    errorMessage.value = t('newsletter.validation.turnstile')
    isSubmitting.value = false
    turnstile.value?.reset()
    return
  }

  try {
    const result = await GqlSubscribeToNewsletter({
      input: {
        email: parsed.data.email,
        name: null,
        source: props.source,
        locale: locale.value,
        turnstileToken: token,
        consentAccepted: true,
        consentText: consentText.value
      }
    })

    const payload = result.subscribeToNewsletter

    if (payload.status === 'PENDING') {
      submitState.value = 'pending'
    } else if (payload.message.toLowerCase().includes('already')) {
      submitState.value = 'already_subscribed'
    } else {
      submitState.value = 'success'
    }

    email.value = ''
    turnstileToken.value = ''
    turnstile.value?.reset()
  } catch (error) {
    submitState.value = 'error'

    const gqlError =
      error && typeof error === 'object'
        ? (error as { response?: { errors?: Array<{ message?: string }> } }).response?.errors?.[0]
        : undefined

    errorMessage.value =
      gqlError?.message || (error instanceof Error ? error.message : t('newsletter.error'))

    turnstileToken.value = ''
    turnstile.value?.reset()
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section v-if="plain" class="w-full space-y-3">
    <div class="space-y-2">
      <component :is="sectionTitle ? 'h2' : 'p'" :class="titleClass">
        {{ resolvedTitle }}
      </component>
      <p class="text-base leading-7 text-pretty text-muted">
        {{ resolvedDescription }}
      </p>
    </div>

    <p v-if="isComplete" class="text-base leading-7 text-highlighted">
      {{ statusMessage }}
    </p>

    <form v-else class="space-y-2.5" @submit.prevent="onSubmit">
      <UFieldGroup class="w-full">
        <UInput
          v-model="email"
          class="min-w-0 flex-1"
          size="sm"
          type="email"
          autocomplete="email"
          :placeholder="t('newsletter.emailLabel')"
          :disabled="isSubmitting"
        />
        <UButton
          type="submit"
          color="primary"
          size="sm"
          icon="i-lucide-mail-plus"
          :loading="isSubmitting"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? t('newsletter.submitting') : t('newsletter.submit') }}
        </UButton>
      </UFieldGroup>

      <p v-if="submitState === 'error'" class="text-sm leading-6 text-error">
        {{ statusMessage }}
      </p>

      <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p class="min-w-0 flex-1 text-sm leading-6 text-muted">
          {{ consentText }}
        </p>

        <div
          class="flex shrink-0 items-center justify-end [&_iframe]:block [&>span]:block [&>span]:min-h-0 [&>span]:leading-none"
        >
          <NuxtTurnstile
            ref="turnstile"
            v-model="turnstileToken"
            element="span"
            :options="{
              action: 'newsletter_subscribe',
              theme: 'auto',
              language: locale,
              appearance: 'interaction-only'
            }"
          />
        </div>
      </div>
    </form>
  </section>

  <UCard
    v-else
    variant="subtle"
    :ui="{
      root: 'w-full rounded-2xl ring-1 ring-default',
      body: 'p-4 sm:p-5'
    }"
  >
    <div class="space-y-3">
      <div class="space-y-2">
        <component :is="sectionTitle ? 'h2' : 'p'" :class="titleClass">
          {{ resolvedTitle }}
        </component>
        <p class="text-base leading-7 text-pretty text-muted">
          {{ resolvedDescription }}
        </p>
      </div>

      <div v-if="isComplete" class="space-y-1.5">
        <p class="text-base leading-7 text-highlighted">
          {{ statusMessage }}
        </p>
        <p class="text-sm leading-6 text-muted">
          {{ t('newsletter.privacyNote') }}
        </p>
      </div>

      <form v-else class="space-y-3" @submit.prevent="onSubmit">
        <UFieldGroup class="w-full">
          <UInput
            v-model="email"
            class="min-w-0 flex-1"
            size="sm"
            type="email"
            autocomplete="email"
            :placeholder="t('newsletter.emailLabel')"
            :disabled="isSubmitting"
          />
          <UButton
            type="submit"
            color="primary"
            size="sm"
            icon="i-lucide-mail-plus"
            :loading="isSubmitting"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? t('newsletter.submitting') : t('newsletter.submit') }}
          </UButton>
        </UFieldGroup>

        <p v-if="submitState === 'error'" class="text-sm leading-6 text-error">
          {{ statusMessage }}
        </p>

        <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <p class="min-w-0 flex-1 text-sm leading-6 text-muted">
            {{ consentText }}
          </p>

          <div
            class="flex shrink-0 items-center justify-end [&_iframe]:block [&>span]:block [&>span]:min-h-0 [&>span]:leading-none"
          >
            <NuxtTurnstile
              ref="turnstile"
              v-model="turnstileToken"
              element="span"
              :options="{
                action: 'newsletter_subscribe',
                theme: 'auto',
                language: locale,
                appearance: 'interaction-only'
              }"
            />
          </div>
        </div>
      </form>
    </div>
  </UCard>
</template>
