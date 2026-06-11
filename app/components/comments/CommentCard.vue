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
  comment: PublicComment
  targetType: CommentTargetType
  targetPath: string
  targetTitle: string
}

defineProps<Props>()

const { locale, t } = useI18n()
const replyingTo = ref<string | null>(null)

function formatDate(value: number) {
  return new Intl.DateTimeFormat(locale.value, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value))
}

function toggleReply(commentId: string) {
  replyingTo.value = replyingTo.value === commentId ? null : commentId
}
</script>

<template>
  <article class="comment-card">
    <header class="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
      <p class="text-ui-sm font-medium text-highlighted">
        {{ comment.authorName }}
      </p>
      <time class="text-ui-xs text-muted" :datetime="new Date(comment.createdAt).toISOString()">
        {{ formatDate(comment.createdAt) }}
      </time>
    </header>

    <p class="comment-card__body text-reader-sm text-default">
      {{ comment.body }}
    </p>

    <button type="button" class="comment-card__reply" @click="toggleReply(comment.id)">
      {{ replyingTo === comment.id ? t('comments.cancelReply') : t('comments.replyAction') }}
    </button>

    <div v-if="replyingTo === comment.id" class="comment-card__reply-form">
      <CommentsCommentForm
        compact
        :target-type="targetType"
        :target-path="targetPath"
        :target-title="targetTitle"
        :parent-id="comment.id"
        @submitted="replyingTo = null"
      />
    </div>

    <div v-if="comment.replies?.length" class="comment-card__replies">
      <article v-for="reply in comment.replies" :key="reply.id" class="comment-card__reply-item">
        <header class="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <p class="text-ui-sm font-medium text-highlighted">
            {{ reply.authorName }}
          </p>
          <time class="text-ui-xs text-muted" :datetime="new Date(reply.createdAt).toISOString()">
            {{ formatDate(reply.createdAt) }}
          </time>
        </header>

        <p class="whitespace-pre-wrap text-reader-sm text-default">
          {{ reply.body }}
        </p>
      </article>
    </div>
  </article>
</template>

<style scoped>
.comment-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-block: 0.75rem;
}

.comment-card + .comment-card {
  border-top: 1px solid color-mix(in oklab, var(--ui-border) 65%, transparent);
}

.comment-card__body {
  white-space: pre-wrap;
}

.comment-card__reply {
  align-self: flex-start;
  font-size: var(--text-ui-sm);
  line-height: var(--text-ui-sm--line-height);
  font-weight: 500;
  color: var(--ui-text-muted);
  transition: color 0.15s ease;
}

.comment-card__reply:hover {
  color: var(--ui-primary);
}

.comment-card__reply-form {
  padding-top: 0.5rem;
}

.comment-card__replies {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.25rem;
  padding-inline-start: 1rem;
  border-inline-start: 1px solid color-mix(in oklab, var(--ui-border) 75%, transparent);
}

.comment-card__reply-item {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}
</style>
