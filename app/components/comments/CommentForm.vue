<script setup lang="ts">
import {
  createCommentFormSchema,
  type CommentFormState
} from '~~/shared/validation/comment-form'
import { COMMENT_ERROR_CODES } from '~~/shared/constants/comments'
import {
  getGraphqlErrorCode,
  getGraphqlErrorMessage,
  getGraphqlHttpStatus
} from '~/utils/graphql-error'

type Props = {
  targetType: 'BLOG_POST'
  targetPath: string
  targetTitle: string
  parentId?: string | null
  compact?: boolean
  submitLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  parentId: null,
  compact: false,
  submitLabel: undefined
})

const emit = defineEmits<{
  submitted: []
}>()

const { locale, t } = useI18n()

type TurnstileWidget = {
  reset: () => void
}

const state = reactive<CommentFormState>({
  authorName: '',
  authorEmail: '',
  body: ''
})

const turnstile = ref<TurnstileWidget | null>(null)
const turnstileToken = ref('')
const isSubmitting = ref(false)
const submitState = ref<'idle' | 'success' | 'error'>('idle')
const formError = ref('')

const schema = computed(() =>
  createCommentFormSchema({
    name: t('comments.validation.name'),
    nameMax: t('comments.validation.nameMax'),
    email: t('comments.validation.email'),
    emailMax: t('comments.validation.emailMax'),
    comment: t('comments.validation.comment'),
    commentMax: t('comments.validation.commentMax'),
    htmlNotAllowed: t('comments.validation.htmlNotAllowed'),
    maxLinks: t('comments.validation.maxLinks')
  })
)

const resolvedSubmitLabel = computed(
  () => props.submitLabel || (props.parentId ? t('comments.submitReply') : t('comments.submit'))
)

const bodyPlaceholder = computed(() =>
  props.parentId ? t('comments.replyPlaceholder') : t('comments.commentPlaceholder')
)

const commentErrorMessages = computed(
  (): Record<string, string> => ({
    [COMMENT_ERROR_CODES.RATE_LIMIT_IP]: t('comments.validation.rateLimitIp'),
    [COMMENT_ERROR_CODES.RATE_LIMIT_EMAIL]: t('comments.validation.rateLimitEmail'),
    [COMMENT_ERROR_CODES.RATE_LIMIT_REPLY]: t('comments.validation.rateLimitReply')
  })
)

function resolveSubmitError(error: unknown) {
  const code = getGraphqlErrorCode(error)

  if (code && commentErrorMessages.value[code]) {
    return commentErrorMessages.value[code]
  }

  if (getGraphqlHttpStatus(error) === 429) {
    return t('comments.validation.rateLimitGraph')
  }

  const message = getGraphqlErrorMessage(error, '').toLowerCase()

  if (message.includes('too many replies')) {
    return t('comments.validation.rateLimitReply')
  }

  if (message.includes('too many comments from this email')) {
    return t('comments.validation.rateLimitEmail')
  }

  if (message.includes('too many comments')) {
    return t('comments.validation.rateLimitIp')
  }

  if (message.includes('too many requests')) {
    return t('comments.validation.rateLimitGraph')
  }

  return getGraphqlErrorMessage(error, t('comments.error'))
}

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

function resetForm() {
  state.authorName = ''
  state.authorEmail = ''
  state.body = ''
  turnstileToken.value = ''
  turnstile.value?.reset()
}

async function onSubmit() {
  formError.value = ''
  submitState.value = 'idle'

  const token = await waitForTurnstileToken()

  if (!token) {
    submitState.value = 'error'
    formError.value = t('comments.validation.turnstile')
    turnstile.value?.reset()
    return
  }

  isSubmitting.value = true

  try {
    await GqlCreateComment({
      input: {
        targetType: props.targetType,
        targetPath: props.targetPath,
        targetTitle: props.targetTitle,
        parentId: props.parentId,
        authorName: state.authorName,
        authorEmail: state.authorEmail,
        body: state.body,
        turnstileToken: token
      }
    })

    submitState.value = 'success'
    resetForm()
    emit('submitted')
  } catch (error) {
    submitState.value = 'error'
    formError.value = resolveSubmitError(error)

    turnstileToken.value = ''
    turnstile.value?.reset()
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="comment-form">
    <div
      v-if="submitState === 'success'"
      class="flex items-start gap-2.5 rounded-lg bg-success/10 px-3 py-2.5"
    >
      <UIcon name="i-lucide-check" class="mt-0.5 size-4 shrink-0 text-success" />
      <p class="text-sm leading-6 text-highlighted">
        {{ t('comments.success') }}
      </p>
    </div>

    <UForm
      v-else
      :schema="schema"
      :state="state"
      class="space-y-3"
      @submit="onSubmit"
    >
      <UFormField
        :label="parentId ? t('comments.replyLabel') : t('comments.commentLabel')"
        name="body"
        required
        class="w-full"
        :ui="{ label: compact ? 'text-xs font-medium' : undefined }"
      >
        <UTextarea
          v-model="state.body"
          class="w-full"
          :rows="compact ? 3 : 5"
          :size="compact ? 'sm' : 'md'"
          autoresize
          :maxrows="compact ? 8 : 12"
          :placeholder="bodyPlaceholder"
          :disabled="isSubmitting"
        />
      </UFormField>

      <div class="flex flex-col gap-2.5">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-end">
          <UFormField name="authorName" required class="min-w-0 flex-1">
            <UInput
              v-model="state.authorName"
              class="w-full"
              size="sm"
              :placeholder="t('comments.namePlaceholder')"
              autocomplete="name"
              :disabled="isSubmitting"
            />
          </UFormField>

          <UFormField name="authorEmail" required class="min-w-0 flex-1">
            <UInput
              v-model="state.authorEmail"
              class="w-full"
              size="sm"
              type="email"
              :placeholder="t('comments.emailPlaceholder')"
              autocomplete="email"
              :disabled="isSubmitting"
            />
          </UFormField>

          <UButton
            type="submit"
            color="primary"
            size="sm"
            icon="i-lucide-send"
            class="w-full shrink-0 sm:w-auto"
            :loading="isSubmitting"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? t('comments.submitting') : resolvedSubmitLabel }}
          </UButton>
        </div>

        <UAlert
          v-if="formError"
          color="error"
          variant="soft"
          icon="i-lucide-circle-alert"
          :title="formError"
          :ui="{ root: 'p-2.5', title: 'text-xs' }"
        />

        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p class="text-xs leading-5 text-muted">
            {{ t('comments.privacyNote') }}
          </p>

          <div class="comment-form__turnstile shrink-0">
            <NuxtTurnstile
              ref="turnstile"
              v-model="turnstileToken"
              :options="{
                action: parentId ? 'comment_reply' : 'comment_create',
                theme: 'auto',
                language: locale,
                appearance: 'interaction-only'
              }"
            />
          </div>
        </div>
      </div>
    </UForm>
  </div>
</template>

<style scoped>
.comment-form :deep(textarea) {
  width: 100%;
}

.comment-form__turnstile :deep(> span) {
  display: block;
  min-height: 0;
  line-height: 0;
}

.comment-form__turnstile :deep(iframe) {
  display: block;
}
</style>
