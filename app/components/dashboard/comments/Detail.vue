<script setup lang="ts">
type CommentStatus = 'PENDING' | 'APPROVED' | 'SPAM' | 'DELETED'

export type DashboardCommentDetail = {
  id: string
  targetPath: string
  targetTitle: string
  authorName: string
  authorEmail: string
  body: string
  status: CommentStatus
  statusReason: string | null
  parentPreview: string | null
  createdAt: number
  updatedAt: number
}

const props = defineProps<{
  comment: DashboardCommentDetail | null
  editBody: string
  mutating?: boolean
}>()

const emit = defineEmits<{
  'update:editBody': [value: string]
  approve: []
  spam: []
  delete: []
  save: []
}>()

const { t, locale } = useI18n()

type BadgeColor = 'primary' | 'info' | 'success' | 'neutral' | 'warning' | 'error'

function getStatusColor(status: CommentStatus): BadgeColor {
  return (
    (
      {
        PENDING: 'warning',
        APPROVED: 'success',
        SPAM: 'error',
        DELETED: 'neutral'
      } satisfies Record<CommentStatus, BadgeColor>
    )[status] ?? 'neutral'
  )
}

function getStatusLabel(status: CommentStatus) {
  return t(`dashboard.comments.status.${status.toLowerCase() as 'pending' | 'approved' | 'spam' | 'deleted'}`)
}

function formatDate(value?: number | null) {
  if (!value) return '—'

  return new Intl.DateTimeFormat(locale.value, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value))
}

const editDraft = computed({
  get: () => props.editBody,
  set: (value: string) => emit('update:editBody', value)
})
</script>

<template>
  <section class="flex h-full w-full min-h-0 flex-col bg-default">
    <DashboardWorkspaceEmpty
      v-if="!comment"
      icon="i-lucide-message-square"
      :title="t('dashboard.comments.detail.emptyTitle')"
      :description="t('dashboard.comments.detail.emptyDescription')"
      class="py-12"
    />

    <template v-else>
      <div class="shrink-0 space-y-3 px-4 py-3">
        <div class="flex flex-wrap items-center gap-2">
          <UBadge :color="getStatusColor(comment.status)" variant="soft" size="sm">
            {{ getStatusLabel(comment.status) }}
          </UBadge>
          <span class="text-xs text-muted">
            {{ formatDate(comment.createdAt) }}
          </span>
        </div>

        <NuxtLink
          :to="comment.targetPath"
          target="_blank"
          class="inline-flex max-w-full items-center gap-1.5 text-xs text-primary hover:underline"
        >
          <UIcon name="i-lucide-file-text" class="size-3.5 shrink-0" />
          <span class="truncate">{{ comment.targetTitle }}</span>
          <UIcon name="i-lucide-external-link" class="size-3 shrink-0 opacity-70" />
        </NuxtLink>

        <dl class="flex flex-wrap gap-x-4 gap-y-1 text-xs">
          <div class="min-w-0">
            <dt class="text-muted">
              {{ t('dashboard.comments.detail.updatedAt') }}
            </dt>
            <dd class="text-highlighted">
              {{ formatDate(comment.updatedAt) }}
            </dd>
          </div>
        </dl>

        <UAlert
          v-if="comment.parentPreview"
          color="neutral"
          variant="soft"
          icon="i-lucide-reply"
          :title="t('dashboard.comments.parentContext')"
          :description="comment.parentPreview"
          :ui="{ root: 'p-2.5', title: 'text-xs', description: 'text-xs' }"
        />

        <UAlert
          v-if="comment.statusReason"
          color="warning"
          variant="soft"
          icon="i-lucide-info"
          :title="t('dashboard.comments.detail.statusReason')"
          :description="comment.statusReason"
          :ui="{ root: 'p-2.5', title: 'text-xs', description: 'text-xs' }"
        />
      </div>

      <UFormField
        :label="t('dashboard.comments.detail.editBody')"
        class="comment-drawer-body min-h-0 flex-1 px-4 pb-3"
        :ui="{
          root: 'flex min-h-0 flex-1 flex-col gap-1.5',
          label: 'shrink-0 text-xs font-medium',
          container: 'flex min-h-0 flex-1 flex-col'
        }"
      >
        <UTextarea
          v-model="editDraft"
          class="h-full min-h-0 w-full"
          :rows="1"
          size="sm"
          :disabled="mutating"
        />
      </UFormField>

      <div class="shrink-0 w-full border-t border-default bg-default px-4 py-3">
        <div class="flex w-full justify-end overflow-x-auto">
          <UFieldGroup size="xs" class="shrink-0">
            <UButton
              v-if="comment.status === 'PENDING'"
              color="success"
              variant="soft"
              icon="i-lucide-check"
              :loading="mutating"
              @click="emit('approve')"
            >
              {{ t('dashboard.comments.actions.approve') }}
            </UButton>

            <UButton
              color="primary"
              variant="soft"
              icon="i-lucide-save"
              :loading="mutating"
              @click="emit('save')"
            >
              {{ t('dashboard.comments.actions.save') }}
            </UButton>

            <UButton
              v-if="comment.status !== 'SPAM'"
              color="warning"
              variant="ghost"
              icon="i-lucide-shield-alert"
              :loading="mutating"
              @click="emit('spam')"
            >
              {{ t('dashboard.comments.actions.spam') }}
            </UButton>

            <UButton
              v-if="comment.status !== 'DELETED'"
              color="error"
              variant="ghost"
              icon="i-lucide-trash-2"
              :loading="mutating"
              @click="emit('delete')"
            >
              {{ t('dashboard.comments.actions.delete') }}
            </UButton>
          </UFieldGroup>
        </div>
      </div>
    </template>
  </section>
</template>

<style scoped>
.comment-drawer-body :deep([data-slot='container']),
.comment-drawer-body :deep(.relative),
.comment-drawer-body :deep(textarea) {
  height: 100%;
  min-height: 0;
}

.comment-drawer-body :deep(textarea) {
  resize: none;
}
</style>
