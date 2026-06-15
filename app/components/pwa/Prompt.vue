<script setup lang="ts">
const { isIOS, isInstallable, shouldShowInstallGuide, promptInstall } = usePwaInstallPrompt()

const dismissed = useCookie<boolean>('mohetios_pwa_install_dismissed', {
  default: () => false,
  maxAge: 60 * 60 * 24 * 7
})

const visible = computed(() => shouldShowInstallGuide.value && !dismissed.value)

async function install() {
  const result = await promptInstall()

  if (result.outcome === 'accepted') {
    dismissed.value = true
  }
}

function dismiss() {
  dismissed.value = true
}
</script>

<template>
  <ClientOnly>
    <UCard
      v-if="visible"
      class="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md shadow-lg sm:left-auto"
    >
      <div class="space-y-3">
        <div>
          <p class="text-base font-medium text-highlighted">Install Mohetios</p>

          <p class="mt-1 text-base leading-7 text-muted">
            Keep the dashboard close and receive admin notifications faster.
          </p>
        </div>

        <p
          v-if="isIOS && !isInstallable"
          class="rounded-lg bg-muted p-3 text-sm leading-6 text-toned"
        >
          On iPhone or iPad, open Safari, tap Share, then choose “Add to Home Screen”.
        </p>

        <div class="flex justify-end gap-2">
          <UButton variant="ghost" color="neutral" size="sm" @click="dismiss"> Not now </UButton>

          <UButton v-if="isInstallable" size="sm" icon="i-lucide-download" @click="install">
            Install app
          </UButton>
        </div>
      </div>
    </UCard>
  </ClientOnly>
</template>
