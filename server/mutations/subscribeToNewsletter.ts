import { eq } from 'drizzle-orm'
import { GraphQLError } from 'graphql'

import { newsletterSubscribers } from '../models/schema'
import type { GraphQLContext } from '../routes/graph'
import { createId } from '../utils/id'
import { normalizeNewsletterSubscriberRow } from '../utils/newsletter-map'
import type { EmailDeliveryJob } from '../../shared/contracts/email'

type SubscribeToNewsletterArgs = {
  input: {
    email: string
    name?: string | null
    source?: string | null
    locale?: string | null
    turnstileToken: string
    consentAccepted: boolean
    consentText: string
  }
}

const CONSENT_VERSION = 'newsletter-consent-v1'

function normalizeText(value: string, maxLength: number, label: string) {
  const normalized = value.trim()

  if (!normalized) {
    throw new GraphQLError(`${label} is required`)
  }

  if (normalized.length > maxLength) {
    throw new GraphQLError(`${label} must be ${maxLength} characters or less`)
  }

  return normalized
}

function normalizeOptionalText(value: string | null | undefined, maxLength: number, label: string) {
  const normalized = value?.trim() || null

  if (normalized && normalized.length > maxLength) {
    throw new GraphQLError(`${label} must be ${maxLength} characters or less`)
  }

  return normalized
}

function normalizeEmail(value: string) {
  const email = normalizeText(value, 254, 'Email')

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new GraphQLError('Email must be valid')
  }

  return email.toLowerCase()
}

async function hashUnsubscribeToken(token: string, secret: string) {
  const data = new TextEncoder().encode(`${secret}:newsletter-unsubscribe:${token}`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

async function createUnsubscribeTokenHash(secret: string) {
  const token = crypto.randomUUID()
  const tokenHash = await hashUnsubscribeToken(token, secret)

  return tokenHash
}

async function queueWelcomeEmail(context: GraphQLContext, subscriberId: string) {
  if (!context.env.EMAIL_DELIVERY_QUEUE) {
    console.warn('EMAIL_DELIVERY_QUEUE binding is missing')
    return
  }

  try {
    await context.env.EMAIL_DELIVERY_QUEUE.send({
      type: 'SEND_NEWSLETTER_WELCOME',
      subscriberId
    } satisfies EmailDeliveryJob)
  } catch (error) {
    console.error('Newsletter welcome email queue failed', {
      subscriberId,
      error
    })
  }
}

export const subscribeToNewsletter = async (
  _parent: unknown,
  args: SubscribeToNewsletterArgs,
  context: GraphQLContext
) => {
  if (args.input.consentAccepted !== true) {
    throw new GraphQLError('Consent is required to subscribe')
  }

  const email = normalizeEmail(args.input.email)
  const name = normalizeOptionalText(args.input.name, 120, 'Name')
  const source = normalizeOptionalText(args.input.source, 80, 'Source')
  const locale = normalizeOptionalText(args.input.locale, 10, 'Locale')
  const consentText = normalizeText(args.input.consentText, 1000, 'Consent text')
  const turnstileToken = normalizeText(args.input.turnstileToken, 2048, 'Verification token')

  const turnstileResult = await verifyTurnstileToken(turnstileToken, context.event)

  if (!turnstileResult.success) {
    throw new GraphQLError('Verification failed. Please try again.')
  }

  const now = Date.now()
  const turnstileVerifiedAt = now

  const [existing] = await context.db
    .select()
    .from(newsletterSubscribers)
    .where(eq(newsletterSubscribers.normalizedEmail, email))
    .limit(1)

  if (existing?.status === 'subscribed') {
    return {
      ok: true,
      status: 'SUBSCRIBED' as const,
      message: "You're already on the list.",
      subscriber: normalizeNewsletterSubscriberRow(existing)
    }
  }

  if (existing?.status === 'pending') {
    return {
      ok: true,
      status: 'PENDING' as const,
      message: 'Please check your inbox to confirm your subscription.',
      subscriber: normalizeNewsletterSubscriberRow(existing)
    }
  }

  if (existing?.status === 'unsubscribed') {
    const unsubscribeTokenHash = await createUnsubscribeTokenHash(context.env.NUXT_JWT_SECRET)

    const [updated] = await context.db
      .update(newsletterSubscribers)
      .set({
        email,
        name: name ?? existing.name,
        status: 'subscribed',
        source: source ?? existing.source,
        locale: locale ?? existing.locale,
        consentText,
        consentVersion: CONSENT_VERSION,
        consentAt: now,
        confirmedAt: now,
        unsubscribedAt: null,
        unsubscribeTokenHash,
        turnstileVerifiedAt,
        updatedAt: now
      })
      .where(eq(newsletterSubscribers.id, existing.id))
      .returning()

    if (!updated) {
      throw new GraphQLError('Subscription could not be updated')
    }

    await queueWelcomeEmail(context, updated.id)

    return {
      ok: true,
      status: 'SUBSCRIBED' as const,
      message: "Thanks — you're subscribed.",
      subscriber: normalizeNewsletterSubscriberRow(updated)
    }
  }

  if (existing) {
    throw new GraphQLError('This email cannot be subscribed at this time')
  }

  const unsubscribeTokenHash = await createUnsubscribeTokenHash(context.env.NUXT_JWT_SECRET)

  const subscriber = {
    id: createId(),
    email,
    normalizedEmail: email,
    name,
    status: 'subscribed' as const,
    source,
    locale,
    tags: null,
    consentText,
    consentVersion: CONSENT_VERSION,
    consentAt: now,
    confirmedAt: now,
    unsubscribedAt: null,
    lastEmailSentAt: null,
    lastOpenedAt: null,
    lastClickedAt: null,
    unsubscribeTokenHash,
    ipHash: null,
    userAgentHash: null,
    turnstileVerifiedAt,
    createdAt: now,
    updatedAt: now
  }

  const [created] = await context.db.insert(newsletterSubscribers).values(subscriber).returning()

  if (!created) {
    throw new GraphQLError('Subscription could not be created')
  }

  await queueWelcomeEmail(context, created.id)

  return {
    ok: true,
    status: 'SUBSCRIBED' as const,
    message: "Thanks — you're subscribed.",
    subscriber: normalizeNewsletterSubscriberRow(created)
  }
}
