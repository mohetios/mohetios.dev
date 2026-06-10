<script setup lang="ts">
defineOptions({
  inheritAttrs: false
})

const props = defineProps<{
  title: string
  description?: string
  category?: string
  locale?: string
  siteName: string
  tagline: string
}>()

const isRtl = computed(() => props.locale === 'fa')
const displayDescription = computed(() =>
  String(props.description || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120)
)
</script>

<template>
  <div
    class="relative flex h-full w-full flex-col justify-between overflow-hidden bg-[#fcfbf8] p-16 text-[#1a2b22]"
    :dir="isRtl ? 'rtl' : 'ltr'"
  >
    <div
      class="pointer-events-none absolute inset-0 opacity-[0.35]"
      style="
        background-image:
          radial-gradient(circle at 20% 20%, rgba(34, 94, 72, 0.08), transparent 42%),
          radial-gradient(circle at 80% 0%, rgba(34, 94, 72, 0.06), transparent 36%),
          linear-gradient(
            135deg,
            rgba(34, 94, 72, 0.04) 0%,
            rgba(34, 94, 72, 0) 45%,
            rgba(34, 94, 72, 0.05) 100%
          );
      "
    />
    <div
      class="pointer-events-none absolute inset-0 opacity-20"
      style="
        background-image: repeating-linear-gradient(
          45deg,
          rgba(34, 94, 72, 0.08) 0,
          rgba(34, 94, 72, 0.08) 1px,
          transparent 1px,
          transparent 18px
        );
      "
    />

    <div class="relative z-10 flex items-center justify-between gap-6">
      <p class="text-[28px] font-medium tracking-[0.08em] text-[#3f6d58] uppercase">
        {{ siteName }}
      </p>
      <p
        v-if="category"
        class="rounded-full border border-[#d7e4dc] bg-white/70 px-5 py-2 text-[22px] text-[#4d6f5d]"
      >
        {{ category }}
      </p>
    </div>

    <div class="relative z-10 mt-10 max-w-[980px] space-y-8">
      <h1
        class="text-[68px] leading-[1.08] font-semibold tracking-[-0.03em] text-[#102018]"
        :class="isRtl ? 'text-right' : 'text-left'"
      >
        {{ title }}
      </h1>
      <p
        v-if="displayDescription"
        class="max-w-[900px] text-[30px] leading-[1.45] text-[#4f6358]"
        :class="isRtl ? 'text-right' : 'text-left'"
      >
        {{ displayDescription }}
      </p>
    </div>

    <p
      class="relative z-10 text-[24px] text-[#6a7f74]"
      :class="isRtl ? 'text-right' : 'text-left'"
    >
      {{ tagline }}
    </p>
  </div>
</template>
