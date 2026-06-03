<script setup lang="ts">
const { isIOS, isInstallable, shouldShowInstallGuide, promptInstall } = usePwaInstallPrompt()

const dismissed = useCookie<boolean>('mohetios_pwa_install_dismissed', {
  default: () => false,
  maxAge: 60 * 60 * 24 * 14
})

const visible = computed(() => shouldShowInstallGuide.value && !dismissed.value)

async function install() {
  await promptInstall()
}

function dismiss() {
  dismissed.value = true
}
</script>

<template>
  <UCard
    v-if="visible"
    class="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md shadow-lg sm:left-auto"
  >
    <div class="space-y-3">
      <div>
        <p class="text-sm font-medium text-neutral-950 dark:text-neutral-50">Install Mohetios</p>

        <p class="mt-1 text-sm leading-6 text-neutral-600 dark:text-neutral-400">
          Keep the dashboard close and receive admin notifications faster.
        </p>
      </div>

      <p
        v-if="isIOS && !isInstallable"
        class="rounded-lg bg-neutral-100 p-3 text-xs leading-6 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
      >
        On iPhone or iPad, tap Share, then choose “Add to Home Screen”.
      </p>

      <div class="flex justify-end gap-2">
        <UButton variant="ghost" color="neutral" size="sm" @click="dismiss"> Not now </UButton>

        <UButton v-if="isInstallable" size="sm" icon="i-lucide-download" @click="install">
          Install app
        </UButton>
      </div>
    </div>
  </UCard>
</template>
