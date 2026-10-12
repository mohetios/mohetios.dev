import { and, eq } from 'drizzle-orm'
import { defineEventHandler, getQuery, setResponseHeader, setResponseStatus } from 'h3'

import { getDb } from '../../models/client'
import { newsletterSubscribers } from '../../models/schema'

// Plain HTTP on purpose: email clients POST here for RFC 8058 one-click unsubscribe,
// and the GET page only asks for confirmation so link scanners can't unsubscribe anyone.

const TOKEN_RE = /^[a-f0-9]{32}$/

const COPY = {
  en: {
    title: 'Unsubscribe',
    confirm: 'Stop receiving the Mohetios.dev newsletter?',
    button: 'Unsubscribe',
    done: 'You are unsubscribed. No more newsletter emails will be sent to you.',
    invalid: 'This unsubscribe link is not valid anymore.',
    back: 'Back to Mohetios.dev'
  },
  fa: {
    title: 'لغو عضویت',
    confirm: 'دیگر خبرنامه‌ی Mohetios.dev را دریافت نکنی؟',
    button: 'لغو عضویت',
    done: 'عضویتت لغو شد و دیگر ایمیل خبرنامه برایت فرستاده نمی‌شود.',
    invalid: 'این لینک لغو عضویت دیگر معتبر نیست.',
    back: 'بازگشت به Mohetios.dev'
  }
}

function page(lang: 'en' | 'fa', message: string, form?: { action: string; button: string }) {
  const copy = COPY[lang]
  const dir = lang === 'fa' ? 'rtl' : 'ltr'

  return `<!doctype html>
<html lang="${lang}" dir="${dir}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${copy.title} · Mohetios.dev</title></head>
<body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#f7f0e4;color:#201b16;font-family:${lang === 'fa' ? 'Vazirmatn,Tahoma' : 'system-ui,-apple-system,Segoe UI'},sans-serif;">
<main style="max-width:420px;margin:24px;padding:32px;background:#fffdf8;border:1px solid #eadfce;border-radius:16px;">
<p style="margin:0 0 8px;font-weight:700;color:#0e7490;">Mohetios.dev</p>
<p style="margin:0 0 24px;font-size:17px;line-height:1.7;">${message}</p>
${form ? `<form method="post" action="${form.action}"><button type="submit" style="padding:12px 20px;border:0;border-radius:10px;background:#0e7490;color:#fff;font:inherit;font-weight:600;cursor:pointer;">${form.button}</button></form>` : `<a href="/${lang}" style="color:#0b6178;">${copy.back}</a>`}
</main>
</body>
</html>`
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const lang = query.lang === 'en' ? 'en' : 'fa'
  const token = typeof query.token === 'string' && TOKEN_RE.test(query.token) ? query.token : null
  const copy = COPY[lang]

  setResponseHeader(event, 'Content-Type', 'text/html; charset=utf-8')
  setResponseHeader(event, 'Cache-Control', 'no-store')

  if (!token) {
    setResponseStatus(event, 404)
    return page(lang, copy.invalid)
  }

  if (event.method === 'GET') {
    return page(lang, copy.confirm, {
      action: `/api/newsletter/unsubscribe?token=${token}&lang=${lang}`,
      button: copy.button
    })
  }

  if (event.method !== 'POST') {
    setResponseStatus(event, 405)
    return page(lang, copy.invalid)
  }

  const now = Date.now()
  const db = getDb(event)
  const [subscriber] = await db
    .select({ id: newsletterSubscribers.id, status: newsletterSubscribers.status })
    .from(newsletterSubscribers)
    .where(eq(newsletterSubscribers.unsubscribeToken, token))
    .limit(1)

  if (!subscriber) {
    setResponseStatus(event, 404)
    return page(lang, copy.invalid)
  }

  await db
    .update(newsletterSubscribers)
    .set({ status: 'unsubscribed', unsubscribedAt: now, updatedAt: now })
    .where(
      and(
        eq(newsletterSubscribers.id, subscriber.id),
        eq(newsletterSubscribers.status, 'subscribed')
      )
    )

  return page(lang, copy.done)
})
