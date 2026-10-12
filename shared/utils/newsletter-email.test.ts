// node --test shared/utils/newsletter-email.test.ts
import assert from 'node:assert/strict'
import { test } from 'node:test'

import { getNextNewsletterSlot, renderNewsletterEmail } from './newsletter-email.ts'

const issue = {
  template: 'WEEKLY' as const,
  locale: 'en' as const,
  subject: 'Notes',
  heading: 'Hi <there>',
  intro: 'One [link](https://a.dev/x?a=1&b=2)\n\nTwo "quoted"',
  items: [{ title: '<b>Post</b>', url: 'https://a.dev/p' }],
  outro: 'Bye'
}

test('escapes content and renders inline links', () => {
  const { html, text } = renderNewsletterEmail(issue, {
    siteUrl: 'https://a.dev/',
    unsubscribeUrl: '%%U%%'
  })

  assert.ok(html.includes('Hi &lt;there&gt;'))
  assert.ok(html.includes('&lt;b&gt;Post&lt;/b&gt;'))
  assert.ok(html.includes('<a href="https://a.dev/x?a=1&amp;b=2"'))
  assert.ok(html.includes('Two &quot;quoted&quot;'))
  assert.ok(html.includes('href="%%U%%"'))
  assert.ok(html.includes('dir="ltr"'))
  assert.ok(text.includes('link (https://a.dev/x?a=1&b=2)'))
  assert.ok(text.includes('%%U%%'))
})

test('persian issues render right-to-left', () => {
  const { html } = renderNewsletterEmail(
    { ...issue, locale: 'fa' },
    { siteUrl: 'https://a.dev', unsubscribeUrl: '#' }
  )

  assert.ok(html.includes('dir="rtl"'))
  assert.ok(html.includes('https://a.dev/fa'))
})

test('next slots land strictly in the future on Monday / the 1st at 09:00', () => {
  const mondayMorning = new Date(2026, 9, 12, 8, 0)
  const mondayNoon = new Date(2026, 9, 12, 12, 0)

  assert.equal(
    getNextNewsletterSlot('WEEKLY', mondayMorning).getTime(),
    new Date(2026, 9, 12, 9).getTime()
  )
  assert.equal(
    getNextNewsletterSlot('WEEKLY', mondayNoon).getTime(),
    new Date(2026, 9, 19, 9).getTime()
  )
  assert.equal(
    getNextNewsletterSlot('MONTHLY', mondayNoon).getTime(),
    new Date(2026, 10, 1, 9).getTime()
  )
  assert.equal(
    getNextNewsletterSlot('MONTHLY', new Date(2026, 11, 1, 8)).getTime(),
    new Date(2026, 11, 1, 9).getTime()
  )
})
