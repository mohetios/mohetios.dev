// Seed local D1 with random EN/FA comments for content UI testing.
//
// Usage:
//   pnpm db:seed:comments
//   pnpm db:seed:comments -- --count=180 --reply-ratio=0.35 --reset
//   pnpm db:seed:comments -- --dry-run

import { execSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const veliteDir = join(repoRoot, '.velite')

const defaults = {
  count: 160,
  replyRatio: 0.3,
  reset: false,
  dryRun: false
}

const enNames = [
  'Ava',
  'Noah',
  'Liam',
  'Emma',
  'Mia',
  'Ethan',
  'Aria',
  'Leo',
  'Nora',
  'Mason'
]

const faNames = [
  'علی',
  'سارا',
  'رضا',
  'نگار',
  'امیر',
  'مهسا',
  'پارسا',
  'نرگس',
  'مانی',
  'الهام'
]

const enBodies = [
  'Very clear breakdown. The structure made the idea easier to follow.',
  'I tested a similar flow yesterday and got almost the same result.',
  'This part about trade-offs was useful. It saved me some trial and error.',
  'I like the practical framing. It feels grounded in real implementation work.',
  'Could you expand this with one more concrete edge case?',
  'The sequencing of steps is excellent. Easy to apply as-is.',
  'This helped me debug my own setup. Thank you.',
  'Short note: this section is stronger than most docs I have read lately.'
]

const faBodies = [
  'خیلی شفاف نوشته شده بود و مسیر تصمیم‌گیری کاملاً معلوم بود.',
  'من هم همین مسیر را تست کردم و نتیجه نزدیک بود.',
  'بخش trade-offها خیلی کاربردی بود و جلوی چند اشتباه را گرفت.',
  'لحن متن خوب بود؛ هم فنی بود هم قابل‌فهم.',
  'اگر یک edge case دیگر اضافه شود کامل‌تر می‌شود.',
  'ترتیب قدم‌ها دقیق بود و مستقیم قابل استفاده است.',
  'همین یادداشت مشکل پیاده‌سازی من را حل کرد.',
  'این قسمت از خیلی از مقاله‌ها عملی‌تر و واقع‌بینانه‌تر بود.'
]

const enReplies = [
  'Agreed, I had the same takeaway.',
  'Good point. I noticed this too while testing.',
  'Thanks for sharing this detail.',
  'Yes, this is exactly where it clicked for me.'
]

const faReplies = [
  'کاملاً موافقم، من هم همین برداشت را داشتم.',
  'نکته خوبی بود، من هم موقع تست به همین رسیدم.',
  'مرسی از توضیح دقیق.',
  'دقیقاً همین قسمت برای من هم جا افتاد.'
]

function parseArgs(argv) {
  const options = { ...defaults }

  for (const arg of argv) {
    if (arg === '--reset') options.reset = true
    if (arg === '--dry-run') options.dryRun = true
    if (arg.startsWith('--count=')) options.count = Math.max(1, Number(arg.split('=')[1] || defaults.count))
    if (arg.startsWith('--reply-ratio=')) {
      const parsed = Number(arg.split('=')[1])
      options.replyRatio = Number.isFinite(parsed) ? Math.min(1, Math.max(0, parsed)) : defaults.replyRatio
    }
  }

  return options
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

function createId() {
  return crypto.randomUUID()
}

function randomTimeInLastDays(days) {
  const now = Date.now()
  const range = days * 24 * 60 * 60 * 1000
  return now - Math.floor(Math.random() * range)
}

async function hashEmail(email) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`seed-comment:${email}`))
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function readVeliteCollection(name) {
  const fullPath = join(veliteDir, `${name}.json`)
  const raw = readFileSync(fullPath, 'utf8')
  const data = JSON.parse(raw)
  return Array.isArray(data) ? data.filter((item) => item && item.path && item.title && !item.draft) : []
}

function buildTargets() {
  const targets = []

  for (const item of readVeliteCollection('blog')) {
    targets.push({ type: 'BLOG_POST', path: item.path, title: item.title })
  }
  for (const item of readVeliteCollection('lab')) {
    targets.push({ type: 'LAB_NOTE', path: item.path, title: item.title })
  }
  for (const item of readVeliteCollection('projects')) {
    targets.push({ type: 'PROJECT', path: item.path, title: item.title })
  }

  return targets
}

function runWrangler(args) {
  execSync(`pnpm exec wrangler d1 execute DB --local --config wrangler.jsonc ${args}`, {
    cwd: repoRoot,
    stdio: 'inherit'
  })
}

function chooseLocaleFromPath(path) {
  return path.startsWith('/fa/') ? 'fa' : 'en'
}

async function buildSql(options) {
  const targets = buildTargets()
  if (!targets.length) {
    throw new Error('No content targets found. Run `pnpm exec velite build` first.')
  }

  const statements = []
  if (options.reset) {
    statements.push('DELETE FROM comments;')
  }

  const parentPool = []

  for (let i = 0; i < options.count; i += 1) {
    const target = pick(targets)
    const locale = chooseLocaleFromPath(target.path)
    const isFa = locale === 'fa'
    const authorName = pick(isFa ? faNames : enNames)
    const authorEmail = `seed-${locale}-${i + 1}@example.com`
    const authorEmailHash = await hashEmail(authorEmail)
    const body = pick(isFa ? faBodies : enBodies)
    const createdAt = randomTimeInLastDays(120)
    const statusRoll = Math.random()
    const status = statusRoll < 0.82 ? 'APPROVED' : statusRoll < 0.94 ? 'PENDING' : 'SPAM'
    const id = createId()

    statements.push(`INSERT INTO comments (
      id, target_type, target_path, target_title, parent_id, depth,
      author_name, author_email, author_email_hash, author_user_id,
      body_original, body, status, status_reason, ip_hash, user_agent_hash,
      approved_at, approved_by, spammed_at, spammed_by, deleted_at, deleted_by,
      edited_at, edited_by, created_at, updated_at
    ) VALUES (
      ${sqlString(id)},
      ${sqlString(target.type)},
      ${sqlString(target.path)},
      ${sqlString(target.title)},
      NULL,
      0,
      ${sqlString(authorName)},
      ${sqlString(authorEmail)},
      ${sqlString(authorEmailHash)},
      NULL,
      ${sqlString(body)},
      ${sqlString(body)},
      ${sqlString(status)},
      NULL,
      'seed-ip-hash',
      'seed-ua-hash',
      ${status === 'APPROVED' ? sqlInt(createdAt) : 'NULL'},
      NULL,
      ${status === 'SPAM' ? sqlInt(createdAt) : 'NULL'},
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      ${sqlInt(createdAt)},
      ${sqlInt(createdAt)}
    );`)

    if (status === 'APPROVED') {
      parentPool.push({ id, target, locale, createdAt })
    }
  }

  const replyCount = Math.floor(parentPool.length * options.replyRatio)
  for (let i = 0; i < replyCount; i += 1) {
    const parent = pick(parentPool)
    const isFa = parent.locale === 'fa'
    const authorName = pick(isFa ? faNames : enNames)
    const authorEmail = `seed-reply-${parent.locale}-${i + 1}@example.com`
    const authorEmailHash = await hashEmail(authorEmail)
    const body = pick(isFa ? faReplies : enReplies)
    const createdAt = Math.max(parent.createdAt + 1, randomTimeInLastDays(90))
    const id = createId()

    statements.push(`INSERT INTO comments (
      id, target_type, target_path, target_title, parent_id, depth,
      author_name, author_email, author_email_hash, author_user_id,
      body_original, body, status, status_reason, ip_hash, user_agent_hash,
      approved_at, approved_by, spammed_at, spammed_by, deleted_at, deleted_by,
      edited_at, edited_by, created_at, updated_at
    ) VALUES (
      ${sqlString(id)},
      ${sqlString(parent.target.type)},
      ${sqlString(parent.target.path)},
      ${sqlString(parent.target.title)},
      ${sqlString(parent.id)},
      1,
      ${sqlString(authorName)},
      ${sqlString(authorEmail)},
      ${sqlString(authorEmailHash)},
      NULL,
      ${sqlString(body)},
      ${sqlString(body)},
      'APPROVED',
      NULL,
      'seed-ip-hash',
      'seed-ua-hash',
      ${sqlInt(createdAt)},
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

  return {
    sql: `${statements.join('\n')}\n`,
    targetsCount: targets.length,
    parentCount: parentPool.length,
    replyCount
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  const { sql, targetsCount, parentCount, replyCount } = await buildSql(options)

  if (options.dryRun) {
    console.log('Dry run complete.')
    console.log(`  targets: ${targetsCount}`)
    console.log(`  top-level approved: ${parentCount}`)
    console.log(`  replies planned: ${replyCount}`)
    return
  }

  const tempDir = mkdtempSync(join(tmpdir(), 'mohetios-comment-seed-'))
  const seedFile = join(tempDir, 'comments-seed.sql')

  try {
    writeFileSync(seedFile, sql, 'utf8')
    console.log('Seeding local D1 comments…')
    runWrangler(`--file=${seedFile}`)
    console.log('Comments seed completed.')
    console.log(`  targets: ${targetsCount}`)
    console.log(`  top-level: ${options.count}`)
    console.log(`  replies: ${replyCount}`)
  } finally {
    rmSync(tempDir, { recursive: true, force: true })
  }
}

main().catch((error) => {
  console.error('Comment seed failed:', error instanceof Error ? error.message : error)
  process.exit(1)
})
