<script setup lang="ts">
type PublicComment = {
  id: string
  authorName: string
  body: string
  createdAt: number
  replies?: PublicComment[]
}

type Props = {
  comment: PublicComment
  targetType: 'BLOG_POST'
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

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

function toggleReply(commentId: string) {
  replyingTo.value = replyingTo.value === commentId ? null : commentId
}
</script>

<template>
  <article class="comment-card">
    <div class="comment-card__main">
      <div class="comment-card__avatar" aria-hidden="true">
        {{ initials(comment.authorName) }}
      </div>

      <div class="comment-card__content">
        <header class="comment-card__header">
          <div class="min-w-0">
            <p class="truncate text-sm font-semibold text-highlighted">
              {{ comment.authorName }}
            </p>
            <time
              class="text-xs text-muted"
              :datetime="new Date(comment.createdAt).toISOString()"
            >
              {{ formatDate(comment.createdAt) }}
            </time>
          </div>
        </header>

        <p class="comment-card__body">
          {{ comment.body }}
        </p>

        <button
          type="button"
          class="comment-card__reply"
          @click="toggleReply(comment.id)"
        >
          <UIcon name="i-lucide-reply" class="size-3.5" />
          <span>{{ replyingTo === comment.id ? t('comments.cancelReply') : t('comments.replyAction') }}</span>
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
      </div>
    </div>

    <div v-if="comment.replies?.length" class="comment-card__replies">
      <article
        v-for="reply in comment.replies"
        :key="reply.id"
        class="comment-card__reply-item"
      >
        <div class="comment-card__reply-avatar" aria-hidden="true">
          {{ initials(reply.authorName) }}
        </div>

        <div class="min-w-0 flex-1 space-y-1.5">
          <div class="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <p class="text-sm font-medium text-highlighted">
              {{ reply.authorName }}
            </p>
            <time class="text-xs text-muted" :datetime="new Date(reply.createdAt).toISOString()">
              {{ formatDate(reply.createdAt) }}
            </time>
          </div>

          <p class="whitespace-pre-wrap text-sm leading-7 text-default">
            {{ reply.body }}
          </p>
        </div>
      </article>
    </div>
  </article>
</template>

<style scoped>
.comment-card {
  border-radius: 0.75rem;
  background: color-mix(in oklab, var(--ui-bg-muted) 35%, transparent);
  padding: 1rem;
}

@media (min-width: 640px) {
  .comment-card {
    padding: 1.25rem;
  }
}

.comment-card__main {
  display: flex;
  gap: 0.875rem;
}

.comment-card__avatar {
  display: flex;
  width: 2.5rem;
  height: 2.5rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  background: color-mix(in oklab, var(--ui-primary) 12%, transparent);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--ui-primary);
}

.comment-card__content {
  min-width: 0;
  flex: 1;
}

.comment-card__header {
  margin-bottom: 0.5rem;
}

.comment-card__body {
  white-space: pre-wrap;
  font-size: 0.9375rem;
  line-height: 1.7;
  color: var(--ui-text);
}

.comment-card__reply {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  margin-top: 0.875rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--ui-text-muted);
  transition: color 0.15s ease;
}

.comment-card__reply:hover {
  color: var(--ui-primary);
}

.comment-card__reply-form {
  margin-top: 1rem;
  border-radius: 0.75rem;
  background: color-mix(in oklab, var(--ui-bg-muted) 45%, transparent);
  padding: 1rem;
}

.comment-card__replies {
  margin-top: 1rem;
  margin-inline-start: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  border-inline-start: 2px solid color-mix(in oklab, var(--ui-primary) 25%, var(--ui-border));
  padding-inline-start: 1rem;
}

.comment-card__reply-item {
  display: flex;
  gap: 0.75rem;
  border-radius: 0.875rem;
  background: color-mix(in oklab, var(--ui-bg-elevated) 65%, transparent);
  padding: 0.875rem;
}

.comment-card__reply-avatar {
  display: flex;
  width: 2rem;
  height: 2rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: color-mix(in oklab, var(--ui-border) 35%, transparent);
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--ui-text-muted);
}
</style>
