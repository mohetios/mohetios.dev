import type { ServerEnv } from '../../utils/env'

export async function sendEmail(
  env: ServerEnv,
  input: {
    to: string
    subject: string
    text: string
    replyTo?: string | null
  }
) {
  if (!env.EMAIL) {
    throw new Error('Email sending binding EMAIL is not configured')
  }

  const result = await env.EMAIL.send({
    to: input.to,
    from: {
      email: env.NUXT_MAIL_FROM,
      name: env.NUXT_MAIL_FROM_NAME
    },
    replyTo: input.replyTo || env.NUXT_MAIL_FROM,
    subject: input.subject,
    text: input.text
  })

  return {
    providerMessageId:
      typeof result === 'object' && result && 'id' in result ? String(result.id) : null
  }
}
