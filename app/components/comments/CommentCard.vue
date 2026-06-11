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
  <article
    class="flex flex-col gap-2 py-3 [&+&]:border-t [&+&]:border-default/65"
  >
    <header class="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
      <p class="text-ui-sm font-medium text-highlighted">
        {{ comment.authorName }}
      </p>
      <time class="text-ui-xs text-muted" :datetime="new Date(comment.createdAt).toISOString()">
        {{ formatDate(comment.createdAt) }}
      </time>
    </header>

    <p class="whitespace-pre-wrap text-reader-sm text-default">
      {{ comment.body }}
    </p>

    <button
      type="button"
      class="self-start text-ui-sm font-medium text-muted transition-colors duration-150 hover:text-primary"
      @click="toggleReply(comment.id)"
    >
      {{ replyingTo === comment.id ? t('comments.cancelReply') : t('comments.replyAction') }}
    </button>

    <div v-if="replyingTo === comment.id" class="pt-2">
      <CommentsCommentForm
        compact
        :target-type="targetType"
        :target-path="targetPath"
        :target-title="targetTitle"
        :parent-id="comment.id"
        @submitted="replyingTo = null"
      />
    </div>

    <div
      v-if="comment.replies?.length"
      class="mt-1 flex flex-col gap-3 border-s border-default/75 ps-4"
    >
      <article
        v-for="reply in comment.replies"
        :key="reply.id"
        class="flex flex-col gap-1.5"
      >
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
