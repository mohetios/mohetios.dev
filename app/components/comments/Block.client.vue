<script setup lang="ts">
import type { CommentTargetType } from '~~/shared/constants/comments'

type PublicComment = {
  id: string
  authorName: string
  body: string
  createdAt: number
  replies?: PublicComment[]
}

type Props = {
  targetType: CommentTargetType
  targetPath: string
  targetTitle: string
}

const props = defineProps<Props>()

const { locale, t } = useI18n()

const comments = ref<PublicComment[]>([])
const isLoading = ref(true)
const loadError = ref(false)
const isComposerOpen = ref(false)
const sortMode = ref<'recent' | 'oldest'>('recent')

const commentCount = computed(() => comments.value.length)
const localizedCommentCount = computed(() => formatLocalizedNumber(commentCount.value, locale.value))

const sortItems = computed(() => [
  { label: t('comments.sortRecent'), value: 'recent' as const },
  { label: t('comments.sortOldest'), value: 'oldest' as const }
])

const sortedComments = computed(() => {
  const sorted = [...comments.value].sort((a, b) => {
    if (sortMode.value === 'oldest') {
      return a.createdAt - b.createdAt
    }

    return b.createdAt - a.createdAt
  })

  return sorted.map((comment) => ({
    ...comment,
    replies: [...(comment.replies ?? [])].sort((a, b) => a.createdAt - b.createdAt)
  }))
})

async function loadComments() {
  isLoading.value = true
  loadError.value = false

  try {
    const result = await GqlPublicComments({
      targetType: props.targetType,
      targetPath: props.targetPath
    })

    comments.value = (result.publicComments ?? []) as PublicComment[]
  } catch {
    loadError.value = true
    comments.value = []
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadComments()
})
</script>

<template>
  <section class="comments-section flex min-w-0 w-full flex-col gap-4">
    <header class="space-y-1.5">
      <h2
        class="text-sm font-medium tracking-[0.14em] text-highlighted uppercase rtl:normal-case rtl:tracking-normal"
      >
        {{ t('comments.title') }}
      </h2>
      <p class="text-base leading-7 text-muted">
        {{ t('comments.moderationNote') }}
      </p>
    </header>

    <div v-if="!loadError" class="flex flex-col gap-3">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <h3 class="text-base leading-7 font-medium text-highlighted">
            {{ t('comments.publishedComments') }}
          </h3>
          <UBadge
            v-if="!isLoading && commentCount"
            size="sm"
            variant="soft"
            color="neutral"
            class="font-medium"
          >
            {{ t('comments.commentCount', { count: localizedCommentCount }) }}
          </UBadge>
        </div>

        <div class="flex items-center gap-2">
          <USelectMenu
            v-model="sortMode"
            :items="sortItems"
            value-key="value"
            size="xs"
            :placeholder="t('comments.sortLabel')"
            class="w-34"
          />
          <UTooltip :text="isComposerOpen ? t('comments.closeForm') : t('comments.openForm')">
            <UButton
              color="neutral"
              variant="soft"
              size="xs"
              icon="i-lucide-message-square-plus"
              :label="isComposerOpen ? t('comments.closeFormShort') : t('comments.addComment')"
              :aria-label="isComposerOpen ? t('comments.closeForm') : t('comments.openForm')"
              @click="() => { isComposerOpen = !isComposerOpen }"
            />
          </UTooltip>
        </div>
      </div>

      <p v-if="!isComposerOpen" class="text-sm leading-6 text-muted">
        {{ t('comments.helperOpenForm') }}
      </p>

      <UCard v-if="isComposerOpen" variant="soft" :ui="{ body: 'p-3 sm:p-4' }">
        <p class="mb-2 text-sm leading-6 text-muted">
          {{ t('comments.helperInForm') }}
        </p>
        <CommentsCommentForm
          :target-type="targetType"
          :target-path="targetPath"
          :target-title="targetTitle"
          @submitted="
            () => {
              isComposerOpen = false
              loadComments()
            }
          "
        />
      </UCard>

      <div v-if="isLoading" class="space-y-2">
        <USkeleton v-for="index in 2" :key="index" class="h-20 w-full" />
      </div>

      <div v-else-if="sortedComments.length" class="space-y-3">
        <CommentsCommentCard
          v-for="comment in sortedComments"
          :key="comment.id"
          :comment="comment"
          :target-type="targetType"
          :target-path="targetPath"
          :target-title="targetTitle"
        />
      </div>

      <p v-else class="text-base leading-7 text-muted">
        {{ t('comments.empty') }}
      </p>
    </div>

    <p v-if="loadError" class="text-base leading-7 text-error">
      {{ t('comments.loadFailed') }}
    </p>
  </section>
</template>
