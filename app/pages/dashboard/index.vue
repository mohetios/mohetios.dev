<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

const { locale, locales, t } = useI18n()
const route = useRoute()

const nextLocale = computed(
  () => locales.value.find((item) => item.code !== locale.value) || locales.value[0]
)
const nextLocalePath = computed(() =>
  nextLocale.value
    ? getLocalizedRoutePath(route.path, nextLocale.value.code, { fallbackToSection: true })
    : undefined
)

useMohetSeo({
  title: () => t('dashboard.title'),
  description: () => t('dashboard.description')
})

const dateRange = ref('Last 30 days')

const stats = [
  {
    label: 'New Leads',
    value: '24',
    delta: '+18%',
    icon: 'i-lucide-users',
    tone: 'success',
    helper: 'From hire and contact forms'
  },
  {
    label: 'Unread Emails',
    value: '8',
    delta: '+7%',
    icon: 'i-lucide-mail',
    tone: 'primary',
    helper: 'Messages awaiting review'
  },
  {
    label: 'Pending Comments',
    value: '5',
    delta: '-12%',
    icon: 'i-lucide-message-square',
    tone: 'warning',
    helper: 'Moderation queue is lighter'
  },
  {
    label: 'Form Submissions',
    value: '31',
    delta: '+24%',
    icon: 'i-lucide-file-text',
    tone: 'success',
    helper: 'Across public site forms'
  }
] as const

const audienceData = [
  { visits: 420, leads: 4 },
  { visits: 610, leads: 6 },
  { visits: 540, leads: 5 },
  { visits: 760, leads: 9 },
  { visits: 690, leads: 7 },
  { visits: 880, leads: 12 },
  { visits: 820, leads: 10 },
  { visits: 970, leads: 14 },
  { visits: 930, leads: 11 },
  { visits: 1100, leads: 16 }
]

const audienceLabels = [
  'May 1',
  'May 4',
  'May 7',
  'May 10',
  'May 13',
  'May 16',
  'May 19',
  'May 22',
  'May 25',
  'May 28'
]

const audienceCategories = {
  visits: {
    name: 'Visits',
    color: '#486a56'
  },
  leads: {
    name: 'Leads',
    color: '#1e4265'
  }
}

const leadSources = [
  { key: 'hire', name: 'Hire Form', value: 46, color: '#486a56' },
  { key: 'contact', name: 'Contact', value: 28, color: '#1e4265' },
  { key: 'email', name: 'Email', value: 16, color: '#c6a15b' },
  { key: 'referral', name: 'Referral', value: 10, color: '#93b09a' }
]

const leadSourceCategories = Object.fromEntries(
  leadSources.map((source) => [
    source.key,
    {
      name: source.name,
      color: source.color
    }
  ])
)

const topPages = [
  { page: '/hire', value: 52 },
  { page: '/about', value: 31 },
  { page: '/projects/safarnak', value: 24 },
  { page: '/writing/product-engineering-notes', value: 15 },
  { page: '/contact', value: 9 }
]

const recentLeads = [
  {
    name: 'Sarah Chen',
    source: 'Hire form',
    status: 'New',
    time: '1h ago'
  },
  {
    name: 'Daniel Mendes',
    source: 'Contact form',
    status: 'Reviewing',
    time: '3h ago'
  },
  {
    name: 'Aisha Patel',
    source: 'Email',
    status: 'Replied',
    time: '6h ago'
  }
]

const pendingComments = [
  {
    author: 'Alex R.',
    page: '/writing/edge-caching',
    text: 'Great breakdown of edge caching.',
    time: '2h ago'
  },
  {
    author: 'Mina J.',
    page: '/projects/safarnak',
    text: 'Could you share more about the stack?',
    time: '5h ago'
  },
  {
    author: 'David K.',
    page: '/about',
    text: 'Love the simplicity here.',
    time: '1d ago'
  }
]

const inbox = [
  {
    sender: 'Sarah Chen',
    subject: 'Potential project inquiry',
    time: '1h ago'
  },
  {
    sender: 'hello@studio.dev',
    subject: 'Collaboration proposal',
    time: '4h ago'
  },
  {
    sender: 'notifications@mohetios.dev',
    subject: 'New lead via hire form',
    time: '6h ago'
  }
]
</script>

<template>
  <UDashboardPanel id="dashboard-overview">
    <template #header>
      <UDashboardNavbar title="Overview" icon="i-lucide-layout-dashboard">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <div class="flex items-center gap-2">
            <UDashboardSearchButton collapsed tooltip :kbds="[]" />
            <UColorModeButton color="neutral" variant="ghost" />
            <UButton
              v-if="nextLocale && nextLocalePath"
              :to="nextLocalePath"
              color="neutral"
              variant="ghost"
              icon="i-lucide-languages"
              :label="nextLocale.code.toUpperCase()"
            />
            <USelect
              v-model="dateRange"
              :items="['Today', 'Last 7 days', 'Last 30 days', 'Last 90 days']"
              class="w-40"
            />
          </div>
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <div class="flex items-center gap-2">
            <UButton color="primary" variant="soft" size="sm">Overview</UButton>
            <UButton color="neutral" variant="ghost" size="sm">Signals</UButton>
            <UButton color="neutral" variant="ghost" size="sm">Leads</UButton>
          </div>
        </template>

        <template #right>
          <UButton color="neutral" variant="ghost" icon="i-lucide-refresh-cw" size="sm">
            Refresh
          </UButton>
          <UButton color="neutral" variant="outline" icon="i-lucide-download" size="sm" disabled>
            Export
          </UButton>
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <div class="space-y-6 p-4 sm:p-6 lg:p-8">
        <UCard>
          <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div class="max-w-2xl space-y-2">
              <h2 class="text-xl font-semibold tracking-normal text-highlighted">
                Mohetios control room
              </h2>
              <p class="text-sm leading-6 text-muted">
                A small panel for leads, inbox, comments, forms, and useful site signals.
              </p>
            </div>

            <div class="flex flex-wrap gap-2">
              <UBadge color="primary" variant="soft">Private</UBadge>
              <UBadge color="neutral" variant="subtle">Mock data</UBadge>
            </div>
          </div>
        </UCard>

        <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <UCard v-for="stat in stats" :key="stat.label" :ui="{ body: 'p-5' }">
            <div class="flex items-start justify-between gap-4">
              <div class="min-w-0">
                <p class="text-sm text-muted">{{ stat.label }}</p>
                <div class="mt-3 flex items-end gap-2">
                  <p class="text-3xl font-semibold tracking-normal">{{ stat.value }}</p>
                  <UBadge :color="stat.tone" variant="soft">{{ stat.delta }}</UBadge>
                </div>
                <p class="mt-3 text-xs leading-5 text-muted">{{ stat.helper }}</p>
              </div>

              <div class="rounded-lg bg-primary/10 p-3 text-primary">
                <UIcon :name="stat.icon" class="size-5" />
              </div>
            </div>
          </UCard>
        </section>

        <section class="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <UCard>
            <template #header>
              <div class="flex items-start justify-between gap-4">
                <div>
                  <h2 class="font-semibold">Audience & Leads</h2>
                  <p class="mt-1 text-sm text-muted">Visits and lead conversions over time.</p>
                </div>
                <UBadge color="neutral" variant="outline">{{ dateRange }}</UBadge>
              </div>
            </template>

            <ClientOnly>
              <LineChart
                :data="audienceData"
                :categories="audienceCategories"
                :height="320"
                :x-formatter="(_tick: number, index?: number) => audienceLabels[index || 0] || ''"
                :y-num-ticks="4"
                y-grid-line
              />
            </ClientOnly>
          </UCard>

          <UCard>
            <template #header>
              <div>
                <h2 class="font-semibold">Lead Sources</h2>
                <p class="mt-1 text-sm text-muted">Unique leads by source.</p>
              </div>
            </template>

            <div class="space-y-5">
              <ClientOnly>
                <DonutChart
                  :data="leadSources.map((source) => source.value)"
                  :categories="leadSourceCategories"
                  :height="260"
                  :radius="96"
                  :arc-width="28"
                  hide-legend
                />
              </ClientOnly>

              <div class="grid gap-2">
                <div
                  v-for="source in leadSources"
                  :key="source.key"
                  class="flex items-center justify-between gap-3 text-sm"
                >
                  <div class="flex min-w-0 items-center gap-2">
                    <span
                      class="size-2 shrink-0 rounded-full"
                      :style="{ backgroundColor: source.color }"
                    />
                    <span class="truncate text-muted">{{ source.name }}</span>
                  </div>
                  <UBadge color="neutral" variant="subtle">{{ source.value }}</UBadge>
                </div>
              </div>
            </div>
          </UCard>
        </section>

        <section class="grid gap-4 xl:grid-cols-4">
          <UCard>
            <template #header>
              <h2 class="font-semibold">Top Lead Pages</h2>
            </template>

            <div class="space-y-4">
              <div v-for="item in topPages" :key="item.page" class="space-y-1">
                <div class="flex items-center justify-between gap-4 text-sm">
                  <span class="truncate text-muted">{{ item.page }}</span>
                  <span class="font-medium">{{ item.value }}</span>
                </div>

                <UProgress :model-value="item.value" :max="60" color="primary" size="sm" />
              </div>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <h2 class="font-semibold">Recent Leads</h2>
            </template>

            <div class="divide-y divide-default">
              <div
                v-for="lead in recentLeads"
                :key="lead.name"
                class="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
              >
                <div class="min-w-0">
                  <p class="truncate text-sm font-medium">{{ lead.name }}</p>
                  <p class="truncate text-xs text-muted">{{ lead.source }}</p>
                </div>

                <div class="flex shrink-0 items-center gap-2">
                  <UBadge color="primary" variant="soft">{{ lead.status }}</UBadge>
                  <span class="text-xs text-muted">{{ lead.time }}</span>
                </div>
              </div>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <h2 class="font-semibold">Pending Comments</h2>
            </template>

            <div class="space-y-4">
              <div
                v-for="comment in pendingComments"
                :key="comment.author"
                class="space-y-2 border-b border-default pb-4 last:border-0 last:pb-0"
              >
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <p class="truncate text-sm font-medium">{{ comment.author }}</p>
                    <p class="truncate text-xs text-muted">{{ comment.page }}</p>
                  </div>

                  <span class="shrink-0 text-xs text-muted">{{ comment.time }}</span>
                </div>

                <p class="line-clamp-2 text-sm text-muted">{{ comment.text }}</p>

                <div class="flex gap-2">
                  <UButton size="xs" color="primary" variant="soft">Approve</UButton>
                  <UButton size="xs" color="neutral" variant="outline">Review</UButton>
                </div>
              </div>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <h2 class="font-semibold">Inbox Snapshot</h2>
            </template>

            <div class="divide-y divide-default">
              <div
                v-for="message in inbox"
                :key="message.subject"
                class="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div class="mt-1 rounded-lg bg-muted p-2">
                  <UIcon name="i-lucide-mail" class="size-4 text-muted" />
                </div>

                <div class="min-w-0 flex-1">
                  <div class="flex items-center justify-between gap-3">
                    <p class="truncate text-sm font-medium">{{ message.sender }}</p>
                    <span class="shrink-0 text-xs text-muted">{{ message.time }}</span>
                  </div>

                  <p class="mt-1 truncate text-sm text-muted">{{ message.subject }}</p>
                </div>
              </div>
            </div>
          </UCard>
        </section>
      </div>
    </template>
  </UDashboardPanel>
</template>
