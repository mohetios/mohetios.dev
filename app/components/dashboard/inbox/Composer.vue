<script setup lang="ts">
const composerMode = defineModel<'reply' | 'note'>('composerMode', { required: true })
const replyBody = defineModel<string>('replyBody', { required: true })
const noteBody = defineModel<string>('noteBody', { default: '' })

const props = defineProps<{
  isSendingReply: boolean
  disableNotes?: boolean
  compact?: boolean
}>()

const emit = defineEmits<{
  sendReply: []
  addPrivateNote: []
}>()

const { t } = useI18n()

watch(
  () => props.disableNotes,
  (disabled) => {
    if (disabled && composerMode.value === 'note') {
      composerMode.value = 'reply'
    }
  },
  { immediate: true }
)
</script>

<template>
  <div
    :class="compact ? 'space-y-2' : 'space-y-3 rounded-xl border border-default bg-muted/20 p-4'"
  >
    <div v-if="!compact" class="flex flex-wrap gap-2">
      <UButton
        :color="composerMode === 'reply' ? 'primary' : 'neutral'"
        :variant="composerMode === 'reply' ? 'soft' : 'ghost'"
        size="sm"
        @click="() => { composerMode = 'reply' }"
      >
        {{ t('dashboard.inbox.composer.reply') }}
      </UButton>
      <UButton
        v-if="!disableNotes"
        :color="composerMode === 'note' ? 'primary' : 'neutral'"
        :variant="composerMode === 'note' ? 'soft' : 'ghost'"
        size="sm"
        @click="() => { composerMode = 'note' }"
      >
        {{ t('dashboard.inbox.composer.note') }}
      </UButton>
    </div>

    <template v-if="composerMode === 'reply'">
      <UTextarea
        v-model="replyBody"
        :placeholder="t('dashboard.inbox.composer.replyPlaceholder')"
        :rows="compact ? 3 : 5"
        :ui="compact ? { base: 'min-h-[88px]' } : undefined"
        class="w-full"
      />

      <div :class="compact ? 'flex justify-end' : 'flex flex-wrap gap-2'">
        <UButton
          color="primary"
          icon="i-lucide-send"
          :loading="isSendingReply"
          :disabled="!replyBody.trim()"
          :size="compact ? 'sm' : 'md'"
          @click="emit('sendReply')"
        >
          {{ t('dashboard.inbox.composer.sendReply') }}
        </UButton>
        <template v-if="!compact">
          <UButton color="neutral" variant="outline" disabled>
            {{ t('dashboard.inbox.composer.saveDraft') }}
          </UButton>
          <UButton color="neutral" variant="ghost" disabled>
            {{ t('dashboard.inbox.composer.generateAiDraft') }}
          </UButton>
        </template>
      </div>
    </template>

    <template v-else-if="!disableNotes">
      <UTextarea
        v-model="noteBody"
        :placeholder="t('dashboard.inbox.composer.notePlaceholder')"
        :rows="compact ? 3 : 5"
        class="w-full"
      />

      <UButton
        color="warning"
        variant="soft"
        icon="i-lucide-lock"
        :disabled="!noteBody.trim()"
        @click="emit('addPrivateNote')"
      >
        {{ t('dashboard.inbox.composer.addPrivateNote') }}
      </UButton>
    </template>
  </div>
</template>
