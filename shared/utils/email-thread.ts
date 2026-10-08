// Shared by the app server and the email worker so both derive the same thread key.
export function createThreadKey(senderEmail: string, subject: string, messageId?: string | null) {
  if (messageId) return `message:${messageId}`

  const threadSubject = subject
    .trim()
    .replace(/^(\s*(re|fw|fwd):\s*)+/i, '')
    .trim()
    .toLowerCase()

  return `${senderEmail.trim().toLowerCase()}:${threadSubject || 'no subject'}`
}
