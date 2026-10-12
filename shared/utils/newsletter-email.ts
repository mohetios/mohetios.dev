// One renderer for the dashboard preview, test sends, and the system worker,
// so what the owner previews is byte-for-byte what subscribers receive.

export const NEWSLETTER_TEMPLATES = ['WEEKLY', 'MONTHLY', 'LETTER', 'ANNOUNCEMENT'] as const
export const NEWSLETTER_LOCALES = ['fa', 'en'] as const

export type NewsletterTemplate = (typeof NEWSLETTER_TEMPLATES)[number]
export type NewsletterLocale = (typeof NEWSLETTER_LOCALES)[number]

export type NewsletterLink = {
  title: string
  url: string
  description?: string | null
  meta?: string | null
}

export type NewsletterIssueContent = {
  template: NewsletterTemplate
  locale: NewsletterLocale
  subject: string
  preheader?: string | null
  heading: string
  intro: string
  items: NewsletterLink[]
  ctaLabel?: string | null
  ctaUrl?: string | null
  outro: string
}

export type NewsletterRenderOptions = {
  siteUrl: string
  unsubscribeUrl: string
  date?: number
}

// Subscribers without a stored locale joined from the default (fa) site.
export const NEWSLETTER_FALLBACK_LOCALE: NewsletterLocale = 'fa'

export function toNewsletterLocale(value?: string | null): NewsletterLocale {
  return value === 'en' ? 'en' : NEWSLETTER_FALLBACK_LOCALE
}

const COPY = {
  en: {
    kicker: {
      WEEKLY: 'Weekly notes',
      MONTHLY: 'Monthly roundup',
      LETTER: 'A letter',
      ANNOUNCEMENT: 'Update'
    },
    itemsTitle: {
      WEEKLY: 'This week',
      MONTHLY: 'This month',
      LETTER: 'Further reading',
      ANNOUNCEMENT: 'Related'
    },
    signoff: '— Ali',
    footer: 'You are getting this because you subscribed on Mohetios.dev.',
    unsubscribe: 'Unsubscribe',
    visit: 'Visit the site'
  },
  fa: {
    kicker: {
      WEEKLY: 'یادداشت‌های هفته',
      MONTHLY: 'مرور ماه',
      LETTER: 'نامه',
      ANNOUNCEMENT: 'خبر'
    },
    itemsTitle: {
      WEEKLY: 'در این هفته',
      MONTHLY: 'در این ماه',
      LETTER: 'برای خواندن بیشتر',
      ANNOUNCEMENT: 'مرتبط'
    },
    signoff: '— علی',
    footer: 'این ایمیل را می‌گیری چون در Mohetios.dev عضو خبرنامه شده‌ای.',
    unsubscribe: 'لغو عضویت',
    visit: 'رفتن به سایت'
  }
} as const

type TemplateDefaults = Pick<NewsletterIssueContent, 'heading' | 'intro' | 'outro'>

const DEFAULTS: Record<NewsletterLocale, Record<NewsletterTemplate, TemplateDefaults>> = {
  en: {
    WEEKLY: {
      heading: 'This week in the notebook',
      intro: 'A short round-up of what I wrote, built, and learned this week.',
      outro: 'Thanks for reading. If something here was useful — or wrong — just reply.'
    },
    MONTHLY: {
      heading: 'The month in review',
      intro:
        'Everything I published this month in one place, with a line on why each piece exists.',
      outro: 'Thanks for reading. If something here was useful — or wrong — just reply.'
    },
    LETTER: { heading: '', intro: '', outro: 'Thanks for reading.' },
    ANNOUNCEMENT: { heading: '', intro: '', outro: 'Thanks for reading.' }
  },
  fa: {
    WEEKLY: {
      heading: 'این هفته در دفترچه',
      intro: 'مروری کوتاه بر چیزهایی که این هفته نوشتم، ساختم و یاد گرفتم.',
      outro: 'ممنون که خواندی. اگر چیزی به کارت آمد یا جایی اشتباه بود، به همین ایمیل جواب بده.'
    },
    MONTHLY: {
      heading: 'مرور این ماه',
      intro: 'همه‌ی نوشته‌های این ماه در یک جا، با یک خط درباره‌ی اینکه هرکدام چرا نوشته شد.',
      outro: 'ممنون که خواندی. اگر چیزی به کارت آمد یا جایی اشتباه بود، به همین ایمیل جواب بده.'
    },
    LETTER: { heading: '', intro: '', outro: 'ممنون که خواندی.' },
    ANNOUNCEMENT: { heading: '', intro: '', outro: 'ممنون که خواندی.' }
  }
}

export function getNewsletterTemplateDefaults(
  template: NewsletterTemplate,
  locale: NewsletterLocale
): TemplateDefaults {
  return DEFAULTS[locale][template]
}

const WELCOME: Record<NewsletterLocale, NewsletterIssueContent> = {
  en: {
    template: 'LETTER',
    locale: 'en',
    subject: 'Welcome to Mohetios.dev',
    preheader: 'Thanks for subscribing.',
    heading: 'Thanks for subscribing',
    intro:
      "You'll receive occasional notes about product engineering, Cloudflare-native systems, AI workflows, open-source experiments, and technical writing.\n\nNo spam. You can unsubscribe anytime.",
    items: [],
    outro: ''
  },
  fa: {
    template: 'LETTER',
    locale: 'fa',
    subject: 'به خبرنامه‌ی Mohetios.dev خوش آمدی',
    preheader: 'ممنون که عضو شدی.',
    heading: 'ممنون که عضو شدی',
    intro:
      'گاه‌به‌گاه یادداشت‌هایی درباره‌ی مهندسی محصول، سیستم‌های Cloudflare-native، جریان‌های کاری AI، تجربه‌های متن‌باز و نوشتن فنی برایت می‌فرستم.\n\nاسپم نمی‌فرستم و هر وقت خواستی می‌توانی لغو عضویت کنی.',
    items: [],
    outro: ''
  }
}

export function getNewsletterWelcomeContent(locale?: string | null) {
  return WELCOME[toNewsletterLocale(locale)]
}

const WEEKDAY_MONDAY = 1
const SLOT_HOUR = 9

// ponytail: fixed Monday / 1st-of-month 09:00 in the owner's browser timezone;
// move to a stored setting if the cadence ever needs to change.
export function getNextNewsletterSlot(cadence: 'WEEKLY' | 'MONTHLY', from = new Date()) {
  const slot = new Date(from)
  slot.setHours(SLOT_HOUR, 0, 0, 0)

  if (cadence === 'WEEKLY') {
    slot.setDate(slot.getDate() + ((WEEKDAY_MONDAY - slot.getDay() + 7) % 7))
    if (slot <= from) slot.setDate(slot.getDate() + 7)
    return slot
  }

  slot.setDate(1)
  if (slot <= from) slot.setMonth(slot.getMonth() + 1)
  return slot
}

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ESCAPES[char] ?? char)
}

const INLINE_LINK_RE = /\[([^\]\n]{1,200})\]\((https?:\/\/[^\s)]{1,2000})\)/g

function paragraphs(value: string) {
  return value
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean)
}

// Plain text with blank-line paragraphs and [label](https://…) links — nothing else.
function richTextHtml(value: string, style: string, linkStyle: string) {
  return paragraphs(value)
    .map((part) => {
      const html = escapeHtml(part)
        .replace(INLINE_LINK_RE, `<a href="$2" style="${linkStyle}">$1</a>`)
        .replace(/\n/g, '<br>')

      return `<p style="${style}">${html}</p>`
    })
    .join('')
}

function richTextPlain(value: string) {
  return paragraphs(value)
    .map((part) => part.replace(INLINE_LINK_RE, '$1 ($2)'))
    .join('\n\n')
}

const COLORS = {
  page: '#f7f0e4',
  card: '#fffdf8',
  border: '#eadfce',
  ink: '#201b16',
  body: '#3d342b',
  muted: '#8a7660',
  brand: '#0e7490',
  brandDark: '#0b6178',
  gold: '#c49a4a'
}

export function renderNewsletterEmail(
  issue: NewsletterIssueContent,
  options: NewsletterRenderOptions
) {
  const copy = COPY[issue.locale]
  const isRtl = issue.locale === 'fa'
  const dir = isRtl ? 'rtl' : 'ltr'
  const align = isRtl ? 'right' : 'left'
  const font = isRtl
    ? "Vazirmatn, Tahoma, 'Segoe UI', Arial, sans-serif"
    : "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif"
  const headingFont = isRtl ? font : "Georgia, 'Times New Roman', serif"
  const siteUrl = options.siteUrl.replace(/\/$/, '')
  const homeUrl = `${siteUrl}/${issue.locale}`
  const date = new Intl.DateTimeFormat(isRtl ? 'fa-IR' : 'en-US', { dateStyle: 'long' }).format(
    new Date(options.date ?? Date.now())
  )

  const textStyle = `margin:0 0 16px;font-size:16px;line-height:1.75;color:${COLORS.body};`
  const linkStyle = `color:${COLORS.brandDark};text-decoration:underline;`

  const itemsHtml = issue.items.length
    ? `<tr><td style="padding:12px 0 4px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;font-weight:600;color:${COLORS.muted};">${escapeHtml(copy.itemsTitle[issue.template])}</td></tr>` +
      issue.items
        .map(
          (item) => `<tr><td style="padding:18px 0;border-top:1px solid ${COLORS.border};">
${item.meta ? `<div style="margin:0 0 6px;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:${COLORS.muted};">${escapeHtml(item.meta)}</div>` : ''}
<a href="${escapeHtml(item.url)}" style="font-family:${headingFont};font-size:19px;line-height:1.4;font-weight:600;color:${COLORS.ink};text-decoration:none;">${escapeHtml(item.title)}</a>
${item.description ? `<div style="margin:6px 0 0;font-size:15px;line-height:1.65;color:${COLORS.body};">${escapeHtml(item.description)}</div>` : ''}
</td></tr>`
        )
        .join('')
    : ''

  const ctaHtml =
    issue.ctaLabel && issue.ctaUrl
      ? `<tr><td style="padding:8px 0 24px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-radius:10px;background:${COLORS.brand};"><a href="${escapeHtml(issue.ctaUrl)}" style="display:inline-block;padding:13px 24px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:10px;">${escapeHtml(issue.ctaLabel)}</a></td></tr></table></td></tr>`
      : ''

  const html = `<!doctype html>
<html lang="${issue.locale}" dir="${dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<title>${escapeHtml(issue.subject)}</title>
</head>
<body style="margin:0;padding:0;background:${COLORS.page};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(issue.preheader || '')}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${COLORS.page};">
<tr><td align="center" style="padding:32px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" dir="${dir}" style="max-width:600px;font-family:${font};text-align:${align};">
<tr><td style="padding:0 8px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="font-size:15px;font-weight:700;letter-spacing:.02em;color:${COLORS.brand};"><a href="${escapeHtml(homeUrl)}" style="color:${COLORS.brand};text-decoration:none;">Mohetios.dev</a></td>
<td style="font-size:13px;color:${COLORS.muted};text-align:${isRtl ? 'left' : 'right'};">${escapeHtml(date)}</td>
</tr></table>
</td></tr>
<tr><td style="background:${COLORS.card};border:1px solid ${COLORS.border};border-radius:16px;padding:36px 32px 28px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td style="padding:0 0 14px;"><div style="width:40px;height:3px;background:${COLORS.gold};border-radius:2px;"></div></td></tr>
<tr><td style="padding:0 0 6px;font-size:12px;letter-spacing:.1em;text-transform:uppercase;font-weight:600;color:${COLORS.brand};">${escapeHtml(copy.kicker[issue.template])}</td></tr>
${issue.heading ? `<tr><td style="padding:0 0 20px;font-family:${headingFont};font-size:30px;line-height:1.3;font-weight:600;color:${COLORS.ink};">${escapeHtml(issue.heading)}</td></tr>` : ''}
<tr><td>${richTextHtml(issue.intro, textStyle, linkStyle)}</td></tr>
${ctaHtml}
${itemsHtml}
${issue.outro ? `<tr><td style="padding:20px 0 0;border-top:${issue.items.length ? `1px solid ${COLORS.border}` : '0'};">${richTextHtml(issue.outro, textStyle, linkStyle)}</td></tr>` : ''}
<tr><td style="padding:4px 0 0;font-size:16px;color:${COLORS.ink};">${escapeHtml(copy.signoff)}</td></tr>
</table>
</td></tr>
<tr><td style="padding:20px 8px 0;font-size:12px;line-height:1.7;color:${COLORS.muted};">
${escapeHtml(copy.footer)}<br>
<a href="${escapeHtml(options.unsubscribeUrl)}" style="color:${COLORS.muted};text-decoration:underline;">${escapeHtml(copy.unsubscribe)}</a>
&nbsp;·&nbsp;
<a href="${escapeHtml(homeUrl)}" style="color:${COLORS.muted};text-decoration:underline;">${escapeHtml(copy.visit)}</a>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`

  const text = [
    `${copy.kicker[issue.template]} · ${date}`,
    issue.heading,
    richTextPlain(issue.intro),
    issue.ctaLabel && issue.ctaUrl ? `${issue.ctaLabel}: ${issue.ctaUrl}` : '',
    issue.items.length
      ? [
          copy.itemsTitle[issue.template],
          ...issue.items.map((item) =>
            [item.meta, item.title, item.description, item.url].filter(Boolean).join('\n')
          )
        ].join('\n\n')
      : '',
    richTextPlain(issue.outro),
    copy.signoff,
    `${copy.footer}\n${copy.unsubscribe}: ${options.unsubscribeUrl}`
  ]
    .filter(Boolean)
    .join('\n\n')

  return { html, text }
}
