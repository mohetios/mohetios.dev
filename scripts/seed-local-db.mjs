// Seeds the local D1 database with a dev owner account and sample dashboard data.
//
// Usage:
//   pnpm db:seed
//
// Requires: migrations applied (`pnpm db:push` runs automatically unless --skip-migrate)

import { execSync } from 'node:child_process'
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const skipMigrate = process.argv.includes('--skip-migrate')

const PBKDF2_ITERATIONS = 100_000
const OWNER = {
  username: 'admin',
  password: '123456789',
  displayName: 'Mohet'
}

function bytesToBase64Url(bytes) {
  return Buffer.from(bytes)
    .toString('base64')
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/, '')
}

function base64UrlToBytes(value) {
  const base64 = value
    .replaceAll('-', '+')
    .replaceAll('_', '/')
    .padEnd(Math.ceil(value.length / 4) * 4, '=')

  return Buffer.from(base64, 'base64')
}

function generateSalt() {
  return bytesToBase64Url(crypto.getRandomValues(new Uint8Array(16)))
}

async function hashPassword(password, salt, iterations = PBKDF2_ITERATIONS) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  )

  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: base64UrlToBytes(salt),
      iterations
    },
    key,
    256
  )

  return bytesToBase64Url(new Uint8Array(bits))
}

async function hashEmail(email) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`seed:${email}`))
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function createId() {
  return crypto.randomUUID()
}

function sqlString(value) {
  return `'${String(value).replace(/'/g, "''")}'`
}

function sqlInt(value) {
  return String(Math.floor(value))
}

function pick(items) {
  return items[Math.floor(Math.random() * items.length)]
}

function daysAgo(days) {
  return Date.now() - days * 24 * 60 * 60 * 1000
}

function runWrangler(args) {
  execSync(`pnpm exec wrangler d1 execute DB --local --config wrangler.jsonc ${args}`, {
    cwd: repoRoot,
    stdio: 'inherit'
  })
}

async function buildSeedSql(ownerId, passwordHash, passwordSalt) {
  const nowIso = new Date().toISOString()
  const statements = []

  statements.push('DELETE FROM inbox_replies;')
  statements.push('DELETE FROM admin_notifications;')
  statements.push('DELETE FROM push_subscriptions;')
  statements.push('DELETE FROM comments;')
  statements.push('DELETE FROM newsletter_subscribers;')
  statements.push('DELETE FROM inbox_messages;')
  statements.push('DELETE FROM users;')

  statements.push(`INSERT INTO users (
    id, username, role, display_name, bio, website, avatar_url,
    password_hash, password_salt, password_iterations, created_at, updated_at
  ) VALUES (
    ${sqlString(ownerId)},
    ${sqlString(OWNER.username)},
    'OWNER',
    ${sqlString(OWNER.displayName)},
    NULL,
    NULL,
    NULL,
    ${sqlString(passwordHash)},
    ${sqlString(passwordSalt)},
    ${sqlInt(PBKDF2_ITERATIONS)},
    ${sqlString(nowIso)},
    ${sqlString(nowIso)}
  );`)

  const inboxIds = []
  const inboxSubjects = [
    'Cloudflare migration question',
    'Freelance backend work',
    'Article feedback',
    'Open-source collaboration',
    'Newsletter sponsorship'
  ]

  for (const [index, subject] of inboxSubjects.entries()) {
    const id = createId()
    inboxIds.push(id)
    const createdAt = daysAgo(index + 1)
    const senderName = pick(['Alex Kim', 'Sara Nouri', 'Dev Team', 'Jamie Lee', 'Ramin H.'])
    const senderEmail = `${senderName.toLowerCase().replace(/[^a-z]+/g, '.')}@example.com`
    const status = pick(['NEW', 'NEW', 'OPEN', 'REPLIED', 'ARCHIVED'])
    const kind = pick(['LEAD', 'COLLABORATION', 'SUPPORT', 'OTHER', 'PERSONAL'])

    statements.push(`INSERT INTO inbox_messages (
      id, source, status, kind, priority, sender_name, sender_email, sender_company, sender_website,
      subject, body_text, body_html, raw_message_id, in_reply_to, thread_key,
      created_at, updated_at, last_activity_at, trashed_at,
      lead_status, lead_priority, lead_next_follow_up_at, lead_notes, lead_estimated_value
    ) VALUES (
      ${sqlString(id)},
      ${sqlString(pick(['CONTACT_FORM', 'EMAIL']))},
      ${sqlString(status)},
      ${sqlString(kind)},
      ${sqlString(pick(['LOW', 'NORMAL', 'HIGH']))},
      ${sqlString(senderName)},
      ${sqlString(senderEmail)},
      NULL,
      NULL,
      ${sqlString(subject)},
      ${sqlString(`Sample message about ${subject.toLowerCase()}. This is local seed data for dashboard testing.`)},
      NULL,
      NULL,
      NULL,
      ${sqlString(`thread-${index + 1}`)},
      ${sqlInt(createdAt)},
      ${sqlInt(createdAt)},
      ${sqlInt(createdAt)},
      NULL,
      ${kind === 'LEAD' ? "'NEW'" : 'NULL'},
      ${kind === 'LEAD' ? sqlString(pick(['LOW', 'MEDIUM', 'HIGH'])) : 'NULL'},
      NULL,
      NULL,
      NULL
    );`)
  }

  const newsletterNames = ['Ada Lovelace', 'Grace Hopper', 'Linus Torvalds', 'Local Reader']
  for (const [index, name] of newsletterNames.entries()) {
    const id = createId()
    const email = `${name.toLowerCase().replace(/[^a-z]+/g, '.')}@example.com`
    const createdAt = daysAgo(index + 2)

    statements.push(`INSERT INTO newsletter_subscribers (
      id, email, normalized_email, name, status, source, locale, tags,
      consent_text, consent_version, consent_at, confirmed_at, unsubscribed_at,
      last_email_sent_at, last_opened_at, last_clicked_at, unsubscribe_token_hash,
      ip_hash, user_agent_hash, turnstile_verified_at, created_at, updated_at
    ) VALUES (
      ${sqlString(id)},
      ${sqlString(email)},
      ${sqlString(email)},
      ${sqlString(name)},
      ${sqlString(pick(['subscribed', 'subscribed', 'pending', 'unsubscribed']))},
      'seed_script',
      ${sqlString(pick(['en', 'fa']))},
      NULL,
      'Local seed consent',
      'newsletter-consent-v1',
      ${sqlInt(createdAt)},
      ${sqlInt(createdAt)},
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      ${sqlInt(createdAt)},
      ${sqlInt(createdAt)}
    );`)
  }

  const blogPath = '/en/blog/building-small-email-client-cloudflare-workers'
  const blogTitle = 'Building a small email client on Cloudflare Workers'
  const commentBodies = [
    'Thanks for the write-up. The queue flow finally clicked for me.',
    'Could you expand on how you handle retries for failed sends?',
    'Small correction: the D1 batch limit changed in a recent release.',
    'This helped me wire up my own inbox prototype over the weekend.'
  ]

  const topLevelCommentIds = []

  for (const [index, body] of commentBodies.entries()) {
    const id = createId()
    topLevelCommentIds.push(id)
    const authorName = pick(['Reader One', 'Cloud Dev', 'Local Guest', 'Engineer'])
    const authorEmail = `comment${index + 1}@example.com`
    const emailHash = await hashEmail(authorEmail)
    const createdAt = daysAgo(index)
    const status = pick(['PENDING', 'APPROVED', 'APPROVED', 'SPAM'])

    statements.push(`INSERT INTO comments (
      id, target_type, target_path, target_title, parent_id, depth,
      author_name, author_email, author_email_hash, author_user_id,
      body_original, body, status, status_reason, ip_hash, user_agent_hash,
      approved_at, approved_by, spammed_at, spammed_by, deleted_at, deleted_by,
      edited_at, edited_by, created_at, updated_at
    ) VALUES (
      ${sqlString(id)},
      'BLOG_POST',
      ${sqlString(blogPath)},
      ${sqlString(blogTitle)},
      NULL,
      0,
      ${sqlString(authorName)},
      ${sqlString(authorEmail)},
      ${sqlString(emailHash)},
      NULL,
      ${sqlString(body)},
      ${sqlString(body)},
      ${sqlString(status)},
      NULL,
      'seed-ip-hash',
      'seed-ua-hash',
      ${status === 'APPROVED' ? sqlInt(createdAt) : 'NULL'},
      ${status === 'APPROVED' ? sqlString(ownerId) : 'NULL'},
      ${status === 'SPAM' ? sqlInt(createdAt) : 'NULL'},
      ${status === 'SPAM' ? sqlString(ownerId) : 'NULL'},
      NULL,
      NULL,
      NULL,
      NULL,
      ${sqlInt(createdAt)},
      ${sqlInt(createdAt)}
    );`)
  }

  const approvedParentId = topLevelCommentIds[0]
  if (approvedParentId) {
    const replyId = createId()
    const replyEmail = 'reply@example.com'
    const replyHash = await hashEmail(replyEmail)
    const createdAt = daysAgo(0.2)

    statements.push(`INSERT INTO comments (
      id, target_type, target_path, target_title, parent_id, depth,
      author_name, author_email, author_email_hash, author_user_id,
      body_original, body, status, status_reason, ip_hash, user_agent_hash,
      approved_at, approved_by, spammed_at, spammed_by, deleted_at, deleted_by,
      edited_at, edited_by, created_at, updated_at
    ) VALUES (
      ${sqlString(replyId)},
      'BLOG_POST',
      ${sqlString(blogPath)},
      ${sqlString(blogTitle)},
      ${sqlString(approvedParentId)},
      1,
      'Reply Guest',
      ${sqlString(replyEmail)},
      ${sqlString(replyHash)},
      NULL,
      'Agree — the queue separation is the important part here.',
      'Agree — the queue separation is the important part here.',
      'APPROVED',
      NULL,
      'seed-ip-hash',
      'seed-ua-hash',
      ${sqlInt(createdAt)},
      ${sqlString(ownerId)},
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      ${sqlInt(createdAt)},
      ${sqlInt(createdAt)}
    );`)
  }

  for (const [index, inboxId] of inboxIds.slice(0, 2).entries()) {
    const id = createId()
    const createdAt = daysAgo(index)

    statements.push(`INSERT INTO admin_notifications (
      id, type, title, body, url, entity_type, entity_id, read_at, created_at
    ) VALUES (
      ${sqlString(id)},
      ${sqlString(pick(['NEW_CONTACT_MESSAGE', 'NEW_INBOUND_EMAIL', 'NEW_COMMENT']))},
      'Seed notification',
      'Local seed notification for dashboard testing.',
      ${sqlString(`/dashboard/inbox?message=${inboxId}`)},
      'inboxMessage',
      ${sqlString(inboxId)},
      NULL,
      ${sqlInt(createdAt)}
    );`)
  }

  return `${statements.join('\n')}\n`
}

async function main() {
  if (!skipMigrate) {
    console.log('Applying migrations to local D1…')
    execSync('pnpm db:push', { cwd: repoRoot, stdio: 'inherit' })
  }

  const ownerId = createId()
  const passwordSalt = generateSalt()
  const passwordHash = await hashPassword(OWNER.password, passwordSalt)
  const sql = await buildSeedSql(ownerId, passwordHash, passwordSalt)

  const tempDir = mkdtempSync(join(tmpdir(), 'mohetios-seed-'))
  const seedFile = join(tempDir, 'seed.sql')

  try {
    writeFileSync(seedFile, sql, 'utf8')

    console.log('Seeding local D1…')
    runWrangler(`--file=${seedFile}`)

    console.log('')
    console.log('Local database seeded.')
    console.log(`  username: ${OWNER.username}`)
    console.log(`  password: ${OWNER.password}`)
    console.log(`  role:     OWNER`)
  } finally {
    rmSync(tempDir, { recursive: true, force: true })
  }
}

main().catch((error) => {
  console.error('Seed failed:', error instanceof Error ? error.message : error)
  process.exit(1)
})
