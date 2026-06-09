<script setup lang="ts">
type PublicComment = {
  id: string
  authorName: string
  body: string
  createdAt: number
  replies?: PublicComment[]
}

type Props = {
  targetType: 'BLOG_POST'
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
  <section class="comments-section mohetios-site-column min-w-0">
    <div class="comments-section__inner">
      <header class="comments-section__header">
        <div class="flex items-start gap-3">
          <div
            class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
            aria-hidden="true"
          >
            <UIcon name="i-lucide-messages-square" class="size-5" />
          </div>

          <div class="min-w-0 space-y-1.5">
            <h2 class="text-xl font-semibold tracking-tight text-highlighted">
              {{ t('comments.title') }}
            </h2>
            <p class="max-w-2xl text-sm leading-6 text-muted">
              {{ t('comments.moderationNote') }}
            </p>
          </div>
        </div>
      </header>

      <div class="comments-section__composer">
        <CommentsCommentForm
          :target-type="targetType"
          :target-path="targetPath"
          :target-title="targetTitle"
        />
      </div>

      <div v-if="!loadError" class="comments-section__list">
        <div class="comments-section__list-header">
          <h3 class="text-sm font-medium text-highlighted">
            {{ t('comments.publishedComments') }}
          </h3>
          <span v-if="!isLoading && commentCount" class="text-xs text-muted">
            {{ t('comments.commentCount', { count: commentCount }) }}
          </span>
        </div>

        <div v-if="isLoading" class="space-y-3">
          <USkeleton v-for="index in 2" :key="index" class="h-28 w-full rounded-2xl" />
        </div>

        <div v-else-if="comments.length" class="space-y-3">
          <CommentsCommentCard
            v-for="comment in comments"
            :key="comment.id"
            :comment="comment"
            :target-type="targetType"
            :target-path="targetPath"
            :target-title="targetTitle"
          />
        </div>

        <div v-else class="comments-section__empty">
          <UIcon name="i-lucide-message-square-dashed" class="size-5 text-muted" />
          <p class="text-sm leading-6 text-muted">
            {{ t('comments.empty') }}
          </p>
        </div>
      </div>

      <UAlert
        v-if="loadError"
        color="error"
        variant="soft"
        icon="i-lucide-circle-alert"
        :title="t('comments.loadFailed')"
      />
    </div>
  </section>
</template>

<style scoped>
.comments-section__inner {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.comments-section__composer {
  border-radius: 0.75rem;
  background: color-mix(in oklab, var(--ui-bg-muted) 45%, transparent);
  padding: 1.25rem;
}

@media (min-width: 640px) {
  .comments-section__composer {
    padding: 1.5rem;
  }
}

.comments-section__list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.comments-section__list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding-bottom: 0.25rem;
}

.comments-section__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  border-radius: 1rem;
  border: 1px dashed color-mix(in oklab, var(--ui-border) 90%, transparent);
  padding: 2rem 1rem;
  text-align: center;
}
</style>
