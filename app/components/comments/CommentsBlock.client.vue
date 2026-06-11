<script setup lang="ts">
type PublicComment = {
  id: string
  authorName: string
  body: string
  createdAt: number
  replies?: PublicComment[]
}

import type { CommentTargetType } from '~~/shared/constants/comments'

type Props = {
  targetType: CommentTargetType
  targetPath: string
  targetTitle: string
}

const props = defineProps<Props>()

const { t } = useI18n()

const comments = ref<PublicComment[]>([])
const isLoading = ref(true)
const loadError = ref(false)

const commentCount = computed(() => comments.value.length)

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
  <section class="comments-section flex min-w-0 w-full flex-col gap-5">
    <header class="space-y-1.5">
      <h2 class="text-ui-xs font-medium tracking-[0.14em] text-highlighted uppercase">
        {{ t('comments.title') }}
      </h2>
      <p class="text-ui-sm text-muted">
        {{ t('comments.moderationNote') }}
      </p>
    </header>

    <CommentsCommentForm
      :target-type="targetType"
      :target-path="targetPath"
      :target-title="targetTitle"
    />

    <div v-if="!loadError" class="flex flex-col gap-3">
      <div class="flex items-center justify-between gap-3">
        <h3 class="text-ui-sm font-medium text-highlighted">
          {{ t('comments.publishedComments') }}
        </h3>
        <span v-if="!isLoading && commentCount" class="text-ui-xs text-muted">
          {{ t('comments.commentCount', { count: commentCount }) }}
        </span>
      </div>

      <div v-if="isLoading" class="space-y-0">
        <USkeleton v-for="index in 2" :key="index" class="h-20 w-full" />
      </div>

      <div v-else-if="comments.length" class="space-y-0">
        <CommentsCommentCard
          v-for="comment in comments"
          :key="comment.id"
          :comment="comment"
          :target-type="targetType"
          :target-path="targetPath"
          :target-title="targetTitle"
        />
      </div>

      <p v-else class="text-ui-sm text-muted">
        {{ t('comments.empty') }}
      </p>
    </div>

    <p v-if="loadError" class="text-ui-sm text-error">
      {{ t('comments.loadFailed') }}
    </p>
  </section>
</template>
