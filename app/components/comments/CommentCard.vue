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
  <article class="relative py-3 [&+&]:border-t [&+&]:border-default/65">
    <span class="absolute inset-y-3 start-0 w-px bg-primary/30" aria-hidden="true" />

    <div class="ms-4 flex flex-col gap-2">
      <header class="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <p class="text-base font-semibold text-highlighted">
          {{ comment.authorName }}
        </p>
        <span class="text-muted">·</span>
        <time class="text-sm text-muted" :datetime="new Date(comment.createdAt).toISOString()">
          {{ formatDate(comment.createdAt) }}
        </time>
      </header>

      <p class="whitespace-pre-wrap text-base leading-7 text-default">
        {{ comment.body }}
      </p>

      <button
        type="button"
        class="inline-flex self-start items-center gap-1 text-sm font-medium text-muted transition-colors duration-150 hover:text-primary"
        @click="toggleReply(comment.id)"
      >
        <UIcon :name="replyingTo === comment.id ? 'i-lucide-x' : 'i-lucide-reply'" class="size-3.5" />
        {{ replyingTo === comment.id ? t('comments.cancelReply') : t('comments.replyAction') }}
      </button>

      <div v-if="replyingTo === comment.id" class="pt-1">
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
        class="relative mt-1 ms-2 flex flex-col gap-3 border-s border-primary/35 ps-4"
      >
        <span
          class="absolute start-[-1px] top-0 h-4 w-3 rounded-es-md border-b border-s border-primary/35"
          aria-hidden="true"
        />
        <article
          v-for="reply in comment.replies"
          :key="reply.id"
          class="py-1"
        >
          <header class="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <p class="text-sm font-semibold text-highlighted">
              {{ reply.authorName }}
            </p>
            <span class="text-muted">·</span>
            <time class="text-xs text-muted" :datetime="new Date(reply.createdAt).toISOString()">
              {{ formatDate(reply.createdAt) }}
            </time>
          </header>

          <p class="mt-1 whitespace-pre-wrap text-sm leading-6 text-default">
            {{ reply.body }}
          </p>
        </article>
      </div>
    </div>
  </article>
</template>
