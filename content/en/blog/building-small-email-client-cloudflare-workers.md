---
title: Receive and Send Email on Your Domain with a Cloudflare Worker
description: A beginner-friendly walkthrough — route domain mail to a Worker, parse and store messages, then send and list mail with simple curl commands. No mail server required.
date: 2026-06-08
thumbnail: /content/cloudflare-email-worker-intro.webp
tags:
  - cloudflare
  - workers
  - email
  - d1
  - serverless
---

# Receive and Send Email on Your Domain with a Cloudflare Worker

## Opening + idea

Cloudflare has a habit I have noticed over the years.

They often take something that already exists, rebuild the developer experience around it, and make it feel easier to use inside the modern web ecosystem.

Workers did that for serverless logic.  
Pages did that for deployment.  
D1, R2, KV, Queues, and Durable Objects all follow the same pattern in different ways.

Email is starting to move in that direction too.

If you have only ever *used* email — Gmail, Outlook, whatever — it can feel like a black box. Mail arrives. You read it. That is the whole experience from the outside.

For your own domain, it often felt the same way for a long time: create an address, forward it to your personal inbox, done. No code. No server. Just a pipe.

Cloudflare Email Routing was mostly that — and it was already useful.

You could create an address like `hi@mohetios.dev`, verify your destination email, and forward incoming messages without running your own mail server.

Later, Email Workers made that same pipe programmable.

Instead of only forwarding an incoming email, you could route it to a Worker and write your own logic:

- inspect the sender
- read the subject
- parse the message
- reject or forward the email
- store the message somewhere
- trigger another workflow

That changes the shape of the problem.

The mental shift is small, but it matters:

```txt
Before:  email arrives → gets forwarded → you read it somewhere else
After:   email arrives → your code runs → you decide what happens next
```

Now the email does not have to be only “forwarded.”  
It can become part of your application.

This article is the warm-up for that idea — not a full inbox, not Postfix, not a mail-server weekend. Just the smallest version where the shift feels real: **mail to your domain becomes an event your code can handle.**

What follows is still stretching, not the heavy lift. A short Worker primer, a map of three paths, a checklist of what you need. The workout starts at Step 1.

## If you have never used a Worker

If Workers are new to you, here is the short version — the one concept to hold before we touch any code.

A **Cloudflare Worker** is a small piece of JavaScript or TypeScript that runs on Cloudflare’s network. You do not provision a server. You write a file, deploy it with Wrangler, and Cloudflare runs it when something triggers it.

For a normal web API, the trigger is an HTTP request. The Worker answers through a `fetch()` handler.

For email, the trigger is different. Someone sends mail to your domain, and Cloudflare calls an `email()` handler instead.

That is the whole idea of this article: **one Worker file, two entry points.**

| Handler | Triggered by | Used for |
|---------|--------------|----------|
| `email()` | Someone mailing your domain | Receive, parse, store, forward |
| `fetch()` | HTTP requests (curl, your app) | Send mail, list stored messages |

You do not need D1, Queues, KV, or the rest of the Cloudflare stack on day one. One domain address and one Worker are enough to learn the system.

Once that lands, the rest of this note is easier to read.

## What we are building

Before building a dashboard inbox for Mohetios, I wanted the smallest version that still feels real — the version I could understand in an afternoon before adding product layers on top.

Not Gmail.  
Not a helpdesk.  
Not an IMAP client.

Just a programmable email layer for one domain address — something small enough to trust, useful enough to keep.

Think of it as four yes/no questions. If you can answer yes to each one, the foundation is solid:

1. Can mail to my domain trigger code?
2. Can I read sender, subject, and body from that mail?
3. Can I send mail back out from the same Worker?
4. If I want memory, can I store messages somewhere simple?

No dashboard yet. No GraphQL yet. No queue yet. Those come after the core feels obvious.

| Capability | How you test it |
|------------|-----------------|
| Receive mail on `hi@yourdomain.com` | Send a real email from Gmail or another account |
| Parse sender, subject, body | Check Worker logs after receive |
| Send outbound mail | `curl POST /send` |
| Store messages (optional) | Enable D1, then `GET /messages` |
| List stored mail (optional) | `curl GET /messages` |

When those four questions have answers, you have something real — even without a UI.

## How data flows

Before Step 1, one picture worth keeping in your head.

Everything in this tutorial passes through **one Worker** named `email-worker-demo`.

Think of three paths into the same file:

**Path 1 — Receive.** Someone emails `hi@yourdomain.com`. Cloudflare receives it, routes it to your Worker, and your `email()` handler runs. This is the moment email becomes an event.

**Path 2 — Send.** You call `POST /send` with curl. The `fetch()` handler validates a token and calls `env.EMAIL.send()`. No inbox UI required.

**Path 3 — List (optional).** If you enabled D1, `GET /messages` reads rows that Path 1 stored earlier.

```mermaid
flowchart LR
  subgraph p1["Path 1 — Receive"]
    direction LR
    A["Gmail"] --> B["hi@domain"] --> C["email()"]
  end

  subgraph p2["Path 2 — Send"]
    direction LR
    D["curl /send"] --> E["fetch()"] --> F["EMAIL.send"]
  end

  subgraph p3["Path 3 — List"]
    direction LR
    G["curl /messages"] --> H["fetch()"] --> I["D1"]
  end
```

I like to build in this order:

```txt
1. Make email arrive at the domain
2. Prove email() runs
3. Parse the message into real fields
4. Send outbound mail with curl
5. Add D1 only if you want a tiny inbox
```

Each step is useful on its own. You do not have to finish the whole list in one sitting.

That is the map. Next: what you actually need on your machine and in Cloudflare.

## What you need

Nothing exotic for the first version:

| Item | Why |
|------|-----|
| Cloudflare account | Host the Worker and email routing |
| Domain on Cloudflare | Email Routing works at the domain level |
| Email Routing enabled | Lets Cloudflare receive mail for your domain |
| Node.js + Wrangler | Create and deploy the Worker locally |
| `postal-mime` | Parse raw email into subject, body, and addresses |

Optional later:

- one D1 database
- one small `emails` table

Workers Paid is only required for one part of this tutorial — real outbound send to arbitrary addresses in Path 2. See [What this costs](#what-this-costs-by-path) below.

That is the whole stack for this note. A full product can add a Nuxt dashboard, GraphQL, and queues. This article stops earlier — on purpose.

## What this costs (by path)

Pricing is the part I always want to know before I commit to a stack — not after I have already wired everything.

The good news for this tutorial: **most of the learning path is cheap or free.** The costs map cleanly to the three paths from [How data flows](#how-data-flows).

| Path | What runs | Free plan | Paid plan ($5/mo minimum) |
|------|-----------|-----------|---------------------------|
| **Path 1 — Receive** | Email Routing + `email()` | Inbound routing is unlimited. Each Worker run counts as a request (100k/day free). | Same inbound rules. Higher CPU limits for heavier parsing. |
| **Path 2 — Send** | `fetch()` + `env.EMAIL.send()` | Not available for arbitrary recipients. Verified destination sends are free. | 3,000 outbound emails/month included, then about $0.35 per 1,000. |
| **Path 3 — List** | `fetch()` + D1 reads | D1 free tier is enough for a toy inbox (millions of reads/day). | Higher included D1 usage on Paid. |

A few plain-language notes:

**Inbound mail is not the expensive part.** Email Routing does not charge per message received. What you pay for on Path 1 is Worker compute — each time someone emails your domain and `email()` runs.

**Outbound mail is where the plan matters.** If you only forward to a verified address, or send only to verified destinations in your account, you can stay on the Free plan longer. The moment you want `POST /send` to mail `someone@example.com` like in Step 6, you need Workers Paid and Email Sending enabled.

**D1 is optional and usually quiet at this scale.** One insert per received email and occasional `GET /messages` reads are tiny next to D1’s free limits. Storage only becomes interesting if you keep a large archive.

### Workers compute (all paths)

Every `email()` invocation and every `fetch()` call counts as a Worker request.

On the **Free** plan, that means about **100,000 requests per day** and about **10 ms of CPU time per invocation** — plenty for learning, a personal domain, or a low-traffic contact address.

On the **Paid** plan, the account includes about **10 million requests per month** and **30 million CPU milliseconds per month** before overage. For a small email Worker, you are unlikely to touch those numbers early.

Cloudflare does not bill for subrequests your Worker makes internally. The inbound email event itself is one billable invocation.

### What I would expect for a personal setup

For a domain that receives a handful of emails per day and sends a few replies:

```txt
Path 1 (receive + parse)  → Free plan is usually enough
Path 2 (send with curl)   → Workers Paid (~$5/mo) when you need real outbound mail
Path 3 (D1 inbox)         → Free D1 tier is usually enough at first
```

That is a very different cost shape than running a VPS mail server — no machine to maintain, and no flat monthly server bill just to keep Postfix alive.

Prices change. Before you ship anything real, check the current numbers:

- Workers pricing: https://developers.cloudflare.com/workers/platform/pricing/
- Email Service pricing: https://developers.cloudflare.com/email-service/platform/pricing/
- D1 pricing: https://developers.cloudflare.com/d1/platform/pricing/

From here, we walk through the setup in the same order I would use on a fresh domain: routing first, Worker second, receive third, send fourth, storage last.

Warm-up done. Step 1 is the first real rep.

---

## Step 1 — Turn on Email Routing (Path 1 setup)

The tutorial does not start with code.

It starts with a simpler question:

```txt
Can Cloudflare receive mail for my domain?
```

Open the dashboard:

```txt
Your domain → Email (or Email Service) → Email Routing → Enable
```

Cloudflare adds the DNS records needed to receive mail. You are not installing Postfix. You are not maintaining a mail server. You are telling Cloudflare: “this domain can accept email.”

At this stage, I would not route to a Worker yet.

I would create one boring forward rule first:

```txt
hi@yourdomain.com → your-personal@gmail.com
```

Send a test email to `hi@yourdomain.com` from Gmail or another account. If it lands in your personal inbox, the domain side is alive.

Only after that would I replace the forward rule with “Send to a Worker.”

```txt
First make email arrive.
Then make email programmable.
```

That small sequencing choice saves a lot of confusion later. If receive does not work, no amount of Worker code will help.

## Step 2 — Create the Worker project

Now we can write code — but still keep the first goal small.

We are not building an inbox.  
We are not designing tables.  
We are creating an empty Worker project and preparing the config file we will grow over the next steps.

From your terminal:

```bash
npm create cloudflare@latest email-worker-demo
cd email-worker-demo
npm install postal-mime
```

`postal-mime` is the one extra package I would add early. Cloudflare gives you the envelope (`from`, `to`, headers). The actual body lives inside raw MIME bytes. `postal-mime` turns that into fields you can read like a normal object.

Next, create `wrangler.toml`. Most of this file can stay commented at first:

```toml
# Worker identity — this name must match what you pick in Email Routing
name = "email-worker-demo"
main = "src/index.ts"
compatibility_date = "2026-06-08"

# Plain config values available as env.FROM_EMAIL, env.ADMIN_TOKEN, etc.
# In production, move ADMIN_TOKEN to a secret: npx wrangler secret put ADMIN_TOKEN
[vars]
FROM_EMAIL = "hi@yourdomain.com"              # allowed "from" address when sending
FORWARD_TO_EMAIL = "your-personal@gmail.com"  # optional: keep a copy while learning
ADMIN_TOKEN = "change-this-to-a-long-random-string"  # protects POST /send and GET /messages

# D1 = Cloudflare's SQLite database at the edge.
# env.DB becomes available in your Worker after you uncomment this block.
# Uncomment after: npx wrangler d1 create email_worker_demo
# [[d1_databases]]
# binding = "DB"
# database_name = "email_worker_demo"
# database_id = "your-d1-database-id"
# migrations_dir = "migrations"

# Email Sending binding — exposes env.EMAIL.send() for outbound mail.
# Requires Workers Paid plan + run: npx wrangler email sending enable yourdomain.com
# Uncomment after enabling Email Sending on your domain
# [[send_email]]
# name = "EMAIL"
# remote = true  # optional: send real mail while running wrangler dev locally
```

A few notes, because this file can look heavier than it is:

- `FROM_EMAIL` is the address you will send from later.
- `FORWARD_TO_EMAIL` is optional, but I like keeping it during learning so mail still reaches my real inbox.
- `ADMIN_TOKEN` protects the HTTP endpoints we add in Step 6.
- the D1 and `send_email` blocks can stay commented until those steps.
- `remote = true` on `send_email` is optional — it lets `wrangler dev` send real outbound mail instead of only logging locally.

Nothing here is wasted config. We are just preparing the file once instead of jumping back and forth later.

On Mohetios, inbound mail lives in `workers/email` and outbound delivery runs through `workers/system` with a queue. This tutorial keeps both directions in one Worker so the learning path stays short.

Deploy once, even before the Worker does anything clever. This registers the name in Cloudflare so Email Routing can find it later:

```bash
npx wrangler deploy
```

## Step 3 — Route the address to your Worker

The Worker exists now, but nothing sends mail to it yet.

That is the missing wire.

Go back to Email Routing in the dashboard:

```txt
Email Routing → Routing rules → Create address
```

| Field | Value |
|-------|-------|
| Address | `hi@yourdomain.com` |
| Action | Send to a Worker |
| Worker | `email-worker-demo` |

From the outside, nothing changes. People still email a normal address.

Inside, the route changes:

```txt
hi@yourdomain.com → email-worker-demo → email()
```

This is the shift I care about most in the whole tutorial. The address stops being “just a forward.” It becomes an entry point into code.

## Step 4 — Receive your first email (Path 1)

Now we write the first real handler.

I would keep version 1 intentionally boring:

- no parsing yet
- no database yet
- no reply logic yet
- just logs, and maybe a forward so the message is still useful

The only question at this step is:

```txt
Does email() run when someone mails my domain?
```

```ts
// src/index.ts — version 1: receive only
//
// Mental model: Cloudflare calls email() whenever someone mails your domain address.
// This is the INBOUND path — completely separate from fetch() (HTTP).

interface Env {
  // Optional vars from wrangler.toml — the ? means "may not exist"
  FORWARD_TO_EMAIL?: string
}

export default {
  // Triggered by: someone sending mail to hi@yourdomain.com
  // NOT triggered by curl or browser requests — that is fetch()
  async email(message, env, ctx): Promise<void> {
    // These fields are free — no parsing needed yet
    console.log('Email received')
    console.log('From:', message.from)       // envelope sender
    console.log('To:', message.to)           // your domain address
    console.log('Subject:', message.headers.get('subject'))

    // forward() only works to a verified destination address in Email Routing.
    // waitUntil keeps forwarding from blocking the handler return.
    if (env.FORWARD_TO_EMAIL) {
      ctx.waitUntil(message.forward(env.FORWARD_TO_EMAIL))
    }
  }
} satisfies ExportedHandler<Env>
```

Deploy again:

```bash
npx wrangler deploy
```

Then test with a real email. I would not trust local simulation alone here — real providers format messages slightly differently.

```txt
To:      hi@yourdomain.com
Subject: First Email Worker test
Body:    Hello from the outside world
```

Open **Workers → email-worker-demo → Logs**. If the wiring is correct, you should see something like:

```txt
Email received
From: you@gmail.com
To: hi@yourdomain.com
Subject: First Email Worker test
```

That is the first real milestone.

Your domain address now triggers code.

If you also set `FORWARD_TO_EMAIL`, the message should still appear in your personal inbox. That forward is a nice safety net while learning.

### Test receive locally (optional)

If you want a faster loop before sending real mail, Wrangler can simulate inbound email locally:

```bash
npx wrangler dev
```

In another terminal:

```bash
# Wrangler local email simulator — hits email(), not fetch()
# Body must be RFC 5322 format and include a Message-ID header
curl --request POST "http://localhost:8787/cdn-cgi/handler/email" \
  --url-query "from=sender@example.com" \
  --url-query "to=hi@yourdomain.com" \
  --data-raw 'From: sender@example.com
To: hi@yourdomain.com
Subject: Local dev test
Content-Type: text/plain; charset=utf-8
Message-ID: <local-dev-test@example.com>

Hello from local development.'
```

If the dev server logs the message, the handler path is working.

Still send one real email before moving on.

---

## Step 5 — Read subject, body, and sender (Path 1)

Once receive works, the next question is natural:

```txt
What can I actually read from this message?
```

Cloudflare already gives you a few useful fields for free:

- `message.from`
- `message.to`
- `message.headers`

That is enough to log sender and subject.

But if you want the body, HTML version, attachments, or cleaner address objects, you need to parse `message.raw`.

This is the part that surprised me the first time. The email does not arrive as a neat JSON object. It arrives as MIME bytes, and you decide how much structure to extract.

We will use `postal-mime` for that. On `postal-mime` v2+, the import pattern is `import PostalMime from 'postal-mime'` and `await PostalMime.parse(raw)` — the same pattern used in Mohetios `workers/email`.

One detail worth remembering: `message.raw` is a stream. Read it once into a buffer, then parse. If you try to read it twice, the second read will be empty.

Here is version 2 of the Worker:

```ts
// src/index.ts — version 2: parse incoming mail
//
// Mental model: message.from / message.to are envelope fields.
// The actual body lives inside message.raw — a MIME stream you must parse once.

import PostalMime from 'postal-mime'

interface Env {
  FORWARD_TO_EMAIL?: string
}

// Email headers can arrive with different casing — normalize lookup
function header(message: ForwardableEmailMessage, name: string) {
  return message.headers.get(name) || message.headers.get(name.toLowerCase()) || ''
}

export default {
  async email(message, env, ctx): Promise<void> {
    // CRITICAL: message.raw is a one-time stream. Buffer it before parsing.
    const raw = await new Response(message.raw).arrayBuffer()
    const parsed = await PostalMime.parse(raw)

    // Prefer parsed fields; fall back to envelope/headers when missing
    const subject = parsed.subject || header(message, 'subject') || '(no subject)'
    const from = parsed.from?.address || message.from
    const text = parsed.text || ''   // plain-text body
    const html = parsed.html || ''   // HTML body (may be empty)

    console.log('From:', from)
    console.log('Subject:', subject)
    console.log('Text:', text.slice(0, 200))  // preview — full body can be large
    console.log('Attachments:', parsed.attachments?.length || 0)

    if (env.FORWARD_TO_EMAIL) {
      ctx.waitUntil(message.forward(env.FORWARD_TO_EMAIL))
    }
  }
} satisfies ExportedHandler<Env>
```

Deploy this version and send yourself another test email. The logs should now show subject, a text preview, and attachment count.

At this point, the email is no longer just passing through the system.

It is data your code can branch on, store, or reply to.

---

## Step 6 — Send email with curl (Path 2)

Receive and send are related, but they do not start the same way.

Receive begins when someone emails your domain.  
Send begins when **you** decide to call your Worker over HTTP.

That is why curl enters the story here.

I like this split because it keeps the mental model clean:

- `email()` is the inbound event path
- `fetch()` is the outbound control path

For this demo, we will expose a tiny protected endpoint:

```txt
POST /send
```

Your laptop calls it with curl. The Worker validates a bearer token and asks Cloudflare to send the message.

### Enable outbound email

Before the code can send anything, the domain needs outbound email enabled.

This is also the step where pricing changes. Real outbound mail to arbitrary recipients requires **Workers Paid** — see [What this costs](#what-this-costs-by-path). Receiving and parsing on Path 1 can still be learned on the Free plan.

From the terminal:

```bash
npx wrangler email sending enable yourdomain.com
```

Or enable it in the dashboard under **Email (or Email Service) → Email Sending**.

Then uncomment the `[[send_email]]` block in `wrangler.toml`, redeploy, and add a `fetch()` handler beside the existing `email()` handler.

This is version 3 — receive on the left, send on the right, same Worker:

```ts
// Add to src/index.ts — version 3: receive + send API
//
// Mental model: one Worker, two entry points
//   email()  → inbound mail from Email Routing
//   fetch()  → HTTP from curl / browser / your app

interface Env {
  EMAIL?: SendEmail          // from [[send_email]] binding — undefined until configured
  FROM_EMAIL: string         // must be an address on your onboarded sending domain
  FORWARD_TO_EMAIL?: string
  ADMIN_TOKEN?: string       // simple bearer guard for demo endpoints
}

// Demo auth only — compare Authorization: Bearer <token> against env.ADMIN_TOKEN
function isAuthorized(request: Request, env: Env) {
  const token = (request.headers.get('Authorization') || '').replace('Bearer ', '').trim()
  return !!env.ADMIN_TOKEN && token === env.ADMIN_TOKEN
}

export default {
  // ... keep your email() handler from version 2 ...

  // Triggered by: curl, browser, or any HTTP client hitting your workers.dev URL
  // This is the OUTBOUND path — you decide when to call env.EMAIL.send()
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url)

    // POST /send — your small "send email" API
    if (request.method === 'POST' && url.pathname === '/send') {
      if (!isAuthorized(request, env)) {
        return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
      }

      // Binding missing? User forgot to uncomment [[send_email]] or redeploy
      if (!env.EMAIL) {
        return Response.json({ ok: false, error: 'EMAIL binding not configured' }, { status: 500 })
      }

      let body: { to?: string; subject?: string; text?: string; html?: string }

      try {
        body = await request.json()
      } catch {
        return Response.json({ ok: false, error: 'Invalid JSON' }, { status: 400 })
      }

      // Keep validation boring — required fields only for this demo
      if (!body.to || !body.subject || !body.text) {
        return Response.json({ ok: false, error: 'to, subject, and text are required' }, { status: 400 })
      }

      // env.EMAIL.send() is Cloudflare Email Sending — not SMTP, not Gmail API
      const result = await env.EMAIL.send({
        to: body.to,
        from: { email: env.FROM_EMAIL, name: 'Email Worker Demo' },
        subject: body.subject,
        text: body.text,       // always include plain text (better deliverability)
        html: body.html        // optional HTML version
      })

      return Response.json({ ok: true, messageId: result.messageId })
    }

    // Default: tiny discovery response so GET / does not 404 silently
    return Response.json({
      ok: true,
      name: 'email-worker-demo',
      routes: ['POST /send', 'GET /messages']
    })
  }
} satisfies ExportedHandler<Env>
```

Deploy again.

Then send mail from your laptop:

```bash
# This calls fetch() → POST /send → env.EMAIL.send()
# Bearer token must match ADMIN_TOKEN in wrangler.toml (or Wrangler secret)
curl --request POST "https://email-worker-demo.<your-subdomain>.workers.dev/send" \
  --header "Authorization: Bearer change-this-to-a-long-random-string" \
  --header "Content-Type: application/json" \
  --data '{
    "to": "someone@example.com",
    "subject": "Hello from my Worker",
    "text": "This email was sent with curl."
  }'
```

If it works, the response looks like:

```json
{ "ok": true, "messageId": "..." }
```

And the recipient should receive a real email a moment later.

One confusing dashboard detail: outbound sends from `env.EMAIL.send()` may still appear as **dropped** in the Email Routing summary even when delivery succeeded. Use Email Service observability logs to confirm real send status.

That is the second milestone: the same Worker that receives mail can also send it.

About `ADMIN_TOKEN`: this is only a demo guard. It is enough to stop random internet traffic from hitting `/send`, but it is not real product auth. In a real app I would use dashboard login, and I would store the token as a Wrangler secret:

```bash
npx wrangler secret put ADMIN_TOKEN
```

### Auto-reply inside `email()`

There is one more send pattern worth knowing, and it does not use curl.

When mail arrives, you can reply from inside `email()` with the same `env.EMAIL` binding:

```ts
// Auto-reply — runs inside email(), not fetch()
// from must use your domain address (FROM_EMAIL), not a random string

await env.EMAIL.send({
  to: message.from,
  from: env.FROM_EMAIL,
  subject: `Re: ${subject}`,
  text: 'Thanks — I got your message.',
  html: '<p>Thanks — I got your message.</p>'
})
```

For threaded replies that stay in the same email conversation, Cloudflare also supports `message.reply()` with a raw MIME message built via `mimetext`. That is more correct for production auto-replies, but heavier for a first tutorial. See the [Email handler docs](https://developers.cloudflare.com/email-service/api/route-emails/email-handler/#reply-to-emails).

This is useful for confirmations and small transactional behavior — not newsletters or bulk mail.

---

## Step 7 — Store messages in D1 (Paths 1 + 3, optional)

Until now, the Worker could receive and send, but it had no memory.

Logs are fine for learning. They are not an inbox.

If you want a minimal mailbox you can query later, D1 is the lightest place to put it. Think of it as a notebook, not a mail product:

- one table
- one row per received email
- no threads
- no labels
- no attachments yet

Path 1 writes the rows when mail arrives.  
Path 3 reads them back through `GET /messages`.

Create the database:

```bash
npx wrangler d1 create email_worker_demo
```

Copy the `database_id` into `wrangler.toml` and uncomment the D1 block, including `migrations_dir = "migrations"`.

Then create `migrations/0001_create_emails.sql`:

```sql
-- Minimal inbox table — boring on purpose.
-- One row per received email. No threads, labels, or attachments yet.

CREATE TABLE IF NOT EXISTS emails (
  id TEXT PRIMARY KEY,           -- crypto.randomUUID() in the Worker
  from_email TEXT NOT NULL,
  from_name TEXT,
  to_email TEXT NOT NULL,
  subject TEXT,
  text_body TEXT,
  html_body TEXT,
  message_id TEXT,               -- RFC Message-ID header when available
  created_at TEXT NOT NULL       -- ISO timestamp
);

-- Speed up "newest first" listing in GET /messages
CREATE INDEX IF NOT EXISTS idx_emails_created_at ON emails (created_at DESC);
```

Apply the migration locally first, then remotely when you are ready:

```bash
npx wrangler d1 migrations apply email_worker_demo --local
npx wrangler d1 migrations apply email_worker_demo --remote
```

Now the Worker needs two small additions:

1. after parsing in `email()`, insert a row
2. in `fetch()`, add `GET /messages`

Here are the pieces:

```ts
// --- Inside email() after parsing ---
// Mental model: receive path writes to D1; HTTP path reads from D1

if (env.DB) {
  // Prepared statements = safe parameter binding (the ? placeholders)
  await env.DB.prepare(
    `INSERT INTO emails (id, from_email, from_name, to_email, subject, text_body, html_body, message_id, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    crypto.randomUUID(),
    parsed.from?.address || message.from,
    parsed.from?.name || '',
    parsed.to?.map((t) => t.address).join(', ') || message.to,  // may be multiple recipients
    subject,
    parsed.text || '',
    parsed.html || '',
    parsed.messageId || '',
    new Date().toISOString()
  ).run()
}

// --- Inside fetch() ---
// GET /messages — curl-friendly inbox preview (last 20 rows)

if (request.method === 'GET' && url.pathname === '/messages') {
  if (!isAuthorized(request, env)) {
    return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }
  if (!env.DB) {
    return Response.json({ ok: false, error: 'D1 not configured' }, { status: 500 })
  }

  const { results } = await env.DB.prepare(
    `SELECT id, from_email, subject, text_body, created_at
     FROM emails ORDER BY created_at DESC LIMIT 20`  // bounded — never return whole table
  ).all()

  return Response.json({ ok: true, messages: results })
}
```

List stored mail:

```bash
# This calls fetch() → GET /messages → reads rows email() stored in D1
curl "https://email-worker-demo.<your-subdomain>.workers.dev/messages" \
  --header "Authorization: Bearer change-this-to-a-long-random-string"
```

At this point, the tutorial version is complete.

You can receive on your domain, send with curl, and optionally list what you stored.

That is already a useful base for a contact flow, internal tool, or later dashboard.

---

## Complete Worker (copy-paste version)

If you want the whole file in one place, here is the final `src/index.ts` with receive, parse, store, send, and list wired together.

I would still build it step by step first. The copy-paste version is easier to understand once you have seen each layer arrive separately.

```ts
// Complete email Worker — two handlers, one file
//
//   email()  inbound:  domain mail → parse → store → optional forward
//   fetch()  outbound: curl POST /send, curl GET /messages

import PostalMime from 'postal-mime'

interface Env {
  DB?: D1Database
  EMAIL?: SendEmail
  FROM_EMAIL: string
  FORWARD_TO_EMAIL?: string
  ADMIN_TOKEN?: string
}

type ParsedEmail = Awaited<ReturnType<typeof PostalMime.parse>>

function header(message: ForwardableEmailMessage, name: string) {
  return message.headers.get(name) || message.headers.get(name.toLowerCase()) || ''
}

function isAuthorized(request: Request, env: Env) {
  const token = (request.headers.get('Authorization') || '').replace('Bearer ', '').trim()
  return !!env.ADMIN_TOKEN && token === env.ADMIN_TOKEN
}

async function storeEmail(message: ForwardableEmailMessage, parsed: ParsedEmail, env: Env) {
  if (!env.DB) return

  const subject = parsed.subject || header(message, 'subject') || '(no subject)'

  await env.DB.prepare(
    `INSERT INTO emails (id, from_email, from_name, to_email, subject, text_body, html_body, message_id, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    crypto.randomUUID(),
    parsed.from?.address || message.from,
    parsed.from?.name || '',
    parsed.to?.map((t) => t.address).join(', ') || message.to,
    subject,
    parsed.text || '',
    parsed.html || '',
    parsed.messageId || header(message, 'message-id'),
    new Date().toISOString()
  ).run()
}

export default {
  async email(message, env, ctx): Promise<void> {
    const raw = await new Response(message.raw).arrayBuffer()
    const parsed = await PostalMime.parse(raw)

    console.log('Received:', parsed.subject || '(no subject)', 'from', parsed.from?.address || message.from)

    await storeEmail(message, parsed, env)

    if (env.FORWARD_TO_EMAIL) {
      ctx.waitUntil(message.forward(env.FORWARD_TO_EMAIL))
    }
  },

  // ── OUTBOUND + READ: called by curl / HTTP clients ──
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url)

    // POST /send — trigger outbound email from your laptop or app
    if (request.method === 'POST' && url.pathname === '/send') {
      if (!isAuthorized(request, env)) {
        return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
      }
      if (!env.EMAIL) {
        return Response.json({ ok: false, error: 'EMAIL binding not configured' }, { status: 500 })
      }

      let body: { to?: string; subject?: string; text?: string; html?: string }
      try {
        body = await request.json()
      } catch {
        return Response.json({ ok: false, error: 'Invalid JSON' }, { status: 400 })
      }

      if (!body.to || !body.subject || !body.text) {
        return Response.json({ ok: false, error: 'to, subject, and text are required' }, { status: 400 })
      }

      const result = await env.EMAIL.send({
        to: body.to,
        from: { email: env.FROM_EMAIL, name: 'Email Worker Demo' },
        subject: body.subject,
        text: body.text,
        html: body.html
      })

      return Response.json({ ok: true, messageId: result.messageId })
    }

    // GET /messages — read what email() stored earlier
    if (request.method === 'GET' && url.pathname === '/messages') {
      if (!isAuthorized(request, env)) {
        return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
      }
      if (!env.DB) {
        return Response.json({ ok: false, error: 'D1 not configured' }, { status: 500 })
      }

      const { results } = await env.DB.prepare(
        `SELECT id, from_email, subject, text_body, created_at
         FROM emails ORDER BY created_at DESC LIMIT 20`
      ).all()

      return Response.json({ ok: true, messages: results })
    }

    // GET / — health/discovery response
    return Response.json({
      ok: true,
      name: 'email-worker-demo',
      routes: ['POST /send', 'GET /messages']
    })
  }
} satisfies ExportedHandler<Env>
```

---

## Test checklist

When I set this up on a new domain, I work through the list in order.

No skipping ahead. Each line proves one layer is real before the next one depends on it.

```txt
[ ] Email Routing enabled on the domain
[ ] hi@yourdomain.com routes to the Worker
[ ] Real inbound email shows up in Worker logs
[ ] postal-mime extracts subject and body
[ ] curl POST /send returns { ok: true, messageId: "..." }
[ ] Recipient receives the outbound email
[ ] curl GET /messages returns stored rows (if D1 is enabled)
[ ] Forwarding still works (if FORWARD_TO_EMAIL is set)
```

Quick reference:

| Path | Action | How to test |
|------|--------|-------------|
| Path 1 | Receive | Send email to `hi@yourdomain.com` |
| Path 1 | Local receive | `curl` to `http://localhost:8787/cdn-cgi/handler/email` |
| Path 2 | Send | `curl -X POST .../send` with JSON body |
| Path 3 | List | `curl .../messages` with bearer token |

---

## What this is not

You do not need Postfix.  
You do not need a mail server.  
You do not need the Gmail API on day one.

This is also not:

- a full IMAP client
- a bulk marketing platform
- a complete helpdesk

It is a small programmable email layer for your own domain — the three paths from [How data flows](#how-data-flows), nothing more.

That is already useful for a personal site, contact flow, or internal tool.

## What comes later

For Mohetios, this Worker layer becomes the base of a private owner inbox — contact form messages and direct domain emails in one place.

A later version could add:

- Nuxt dashboard UI
- GraphQL over D1
- queues for reliable outbound delivery
- attachments in R2
- labels, search, spam scoring

Those are product decisions.  
This article is only the first layer: making email an event your code can handle.

## Closing

The main idea is simple: **mail to your domain becomes an event your code can handle.**

You end up with:

- one domain address (`hi@yourdomain.com`)
- one Worker (`email()` for receive, `fetch()` for send/list)
- three paths — receive, send, list — each testable on its own

Small enough to understand.  
Useful enough to build on.  
Clear enough to turn into a real product later.

Once the three paths work, the rest is mostly product design — dashboard, history, labels, notifications. That can wait.

For now, I only want the data flow to be clear.

## Source notes

Cloudflare documentation and Mohetios code used while reviewing this note:

- Email Service overview: https://developers.cloudflare.com/email-service/
- Email handler (`email()`, `forward()`, `reply()`): https://developers.cloudflare.com/email-service/api/route-emails/email-handler/
- Email Sending Workers API: https://developers.cloudflare.com/email-service/api/send-emails/workers-api/
- Local routing development: https://developers.cloudflare.com/email-service/local-development/routing/
- Local sending development: https://developers.cloudflare.com/email-service/local-development/sending/
- Email Service pricing: https://developers.cloudflare.com/email-service/platform/pricing/
- Workers pricing: https://developers.cloudflare.com/workers/platform/pricing/
- D1 pricing: https://developers.cloudflare.com/d1/platform/pricing/
- D1 migrations: https://developers.cloudflare.com/d1/reference/migrations/

Mohetios production references in this repo (reviewed June 2026):

- `workers/email` — inbound only: `PostalMime.parse()`, D1 insert, queue notification, `ctx.waitUntil(message.forward(...))` for backup forward
- `workers/system` — outbound only: queue consumer, `EmailMessage` + `mimetext`, `env.EMAIL.send()` via `send_email` binding in `wrangler.jsonc`

This tutorial keeps receive + send in one Worker for learning. The production split above is the pattern Mohetios uses once queues and a dashboard enter the picture.
