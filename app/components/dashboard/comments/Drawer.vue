<script setup lang="ts">
import type { DashboardCommentDetail } from '~/components/dashboard/comments/Detail.vue'

defineProps<{
  comment: DashboardCommentDetail | null
  editBody: string
  mutating?: boolean
}>()

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  'update:editBody': [value: string]
  approve: []
  spam: []
  delete: []
  save: []
}>()

const { t } = useI18n()

const drawerUi = {
  content:
    'inset-y-0 end-0 h-full w-[min(100vw,24rem)] max-w-none flex-col rounded-none p-0 ring-0',
  container: 'flex h-full w-full min-h-0 flex-col gap-0 overflow-hidden p-0',
  header: 'shrink-0 border-b border-default px-4 py-3',
  title: 'truncate text-sm font-semibold text-highlighted',
  description: 'truncate text-xs text-muted',
  body: 'min-h-0 flex-1 overflow-hidden p-0',
  footer: 'hidden'
}
</script>

<template>
  <UDrawer
    v-model:open="open"
    direction="right"
    :handle="false"
    :inset="false"
    :title="comment?.authorName || t('dashboard.comments.detailTitle')"
    :description="comment ? comment.authorEmail : undefined"
    :ui="drawerUi"
  >
    <template #body>
      <DashboardCommentsDetail
        :comment="comment"
        :edit-body="editBody"
        :mutating="mutating"
        @update:edit-body="emit('update:editBody', $event)"
        @approve="emit('approve')"
        @spam="emit('spam')"
        @delete="emit('delete')"
        @save="emit('save')"
      />
    </template>
  </UDrawer>
</template>
