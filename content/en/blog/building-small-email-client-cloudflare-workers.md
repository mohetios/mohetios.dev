---
title: Building a Small Email Client for My Domain with Cloudflare Workers
description: A practical note about making email programmable with Cloudflare Email Routing, Email Workers, optional D1 storage, and simple sending/reply flows.
date: 2026-06-08
thumbnail: /content/cloudflare-email-worker-intro.webp
tags:
  - cloudflare
  - workers
  - email
  - d1
  - serverless
---

# Building a Small Email Client for My Domain with Cloudflare Workers

## Opening + idea

Cloudflare has a habit I have noticed over the years.

They often take something that already exists, rebuild the developer experience around it, and make it feel easier to use inside the modern web ecosystem.

Workers did that for serverless logic.  
Pages did that for deployment.  
D1, R2, KV, Queues, and Durable Objects all follow the same pattern in different ways.

Email is starting to move in that direction too.

For a long time, Cloudflare Email Routing was mostly useful for receiving email on your own domain and forwarding it somewhere else.

You could create an address like `hi@mohetios.dev`, verify your destination email, and forward incoming messages without running your own mail server.

Later, Email Workers made that flow more interesting.

Instead of only forwarding an incoming email, you could route it to a Worker and write your own logic:

- inspect the sender
- read the subject
- parse the message
- reject or forward the email
- store the message somewhere
- trigger another workflow

That changes the shape of the problem.

Now the email does not have to be only “forwarded.”  
It can become part of your application.

## What we are building

Before building a complete dashboard inbox, I want to start with the smallest useful version.

One Worker.

One custom domain address.

One small email flow.

The goal is not to build Gmail.

The goal is not to build a full helpdesk.

The goal is not to design a complete support platform.

The goal is to understand how simple this technology can feel when email becomes programmable.

We are going to create a small email service for a custom domain using Cloudflare Workers.

The first version should help us understand four things:

1. how to create a custom email address for a domain
2. how to route incoming email to a Worker
3. how to handle the incoming email inside code
4. how to send or reply to email from Worker code

This version can stay intentionally small.

No Nuxt dashboard yet.  
No GraphQL layer yet.  
No queue yet.  
No complex database model yet.  
No full inbox UI yet.

Just the core email flow.

Once that flow is clear, we can grow it into a better system.

## Requirements

We do not need a large stack for the first version.

The minimum setup is:

- a Cloudflare account
- a domain added to Cloudflare
- Cloudflare DNS enabled for that domain
- Email Routing enabled
- one Cloudflare Worker
- Wrangler installed locally
- Node.js available locally
- one custom email address like `hi@yourdomain.com`

Then, if we want to store messages, we add:

- one D1 database
- one small `emails` table

And if we want to send email from code, we also need:

- Email Sending configured for the domain
- a `send_email` binding in `wrangler.toml`
- Workers Paid plan for real outbound sending

For the first learning version, I would not start with the whole product.

I would start with the smallest proof:

```txt
custom address → Email Worker → log the message
```

Then I would add storage.

Then I would add sending.

That order keeps the system easy to understand.

## Architecture

For this note, the system is:

```txt
Incoming email
   ↓
Cloudflare Email Routing
   ↓
Single Worker
   ↓
Store or process the message
   ↓
Send or reply from code
```

That is enough for the first learning version.

The bigger Mohetios version could look like this:

```txt
Incoming email
   ↓
Cloudflare Email Routing
   ↓
Email Worker
   ↓
D1 database
   ↓
Nuxt dashboard
```

Then, for replies:

```txt
Dashboard reply
   ↓
Nuxt server / GraphQL mutation
   ↓
Queue or system Worker
   ↓
Cloudflare email sending
```

That architecture is useful for a real product dashboard.

The Email Worker receives mail.  
The database stores normalized messages.  
The dashboard reads and manages messages.  
The reply flow sends outgoing mail.  
The queue protects the UI from delivery failures.

But that is not where this note starts.

This note starts with one Worker and one email address.

## Setup: Routing + Worker

Before writing any serious code, I want to make the first goal very small.

I do not want to build an inbox yet.

I do not want to design tables yet.

I do not want to send replies yet.

The first useful test is much simpler:

```txt
Can I send an email to my domain and make a Worker receive it?
```

That is the core of this technology.

If that part works, everything else becomes easier.

### Step 1: Enable Email Routing

The first thing we need is a domain inside Cloudflare.

This part matters because Email Routing works at the domain level. Cloudflare needs to know how to receive email for the domain before it can route that email somewhere else.

So the flow starts in the Cloudflare dashboard:

```txt
Cloudflare dashboard
  ↓
Your domain
  ↓
Email Routing
  ↓
Enable routing
```

When Email Routing is enabled, Cloudflare adds the needed DNS records for receiving email on that domain.

This is the part that replaces the old feeling of:

```txt
I need to run my own mail server.
```

with something smaller:

```txt
I need to let Cloudflare receive mail for this domain.
```

That is a good first step.

At this stage, we are not doing anything fancy. We are only preparing the domain so Cloudflare can accept incoming email.

A good test after enabling Email Routing is to create a simple forwarding address first. No Worker yet. Just normal forwarding.

Something like:

```txt
hi@yourdomain.com → your personal inbox
```

If this works, we know the domain routing is alive.

Then we can replace the forwarding behavior with a Worker.

That is the clean path:

```txt
First make email arrive.
Then make email programmable.
```

### Step 2: Create a custom email address

After Email Routing is enabled, we need a custom address.

For example:

```txt
hi@yourdomain.com
```

or:

```txt
support@yourdomain.com
```

or:

```txt
inbox@yourdomain.com
```

For this note, I will use:

```txt
hi@yourdomain.com
```

The custom address is the public entry point.

People do not email the Worker directly. They email the address.

Cloudflare receives that email and then decides what to do with it.

In the normal forwarding version, the route looks like this:

```txt
hi@yourdomain.com
  ↓
personal@gmail.com
```

In the Worker version, the route becomes this:

```txt
hi@yourdomain.com
  ↓
Email Worker
```

This is the important shift.

The email address still looks normal from the outside.

But inside the system, the email becomes an event your code can handle.

That is the part I want to learn first.

### Step 3: Create the Email Worker

Now we create the Worker.

I prefer doing this from code instead of only editing inside the dashboard, because later I can add packages, D1, deploy scripts, and keep the code in Git.

Create a new Worker project:

```bash
npm create cloudflare@latest email-worker-demo
cd email-worker-demo
```

For this note, a normal “Hello World” Worker is enough as a starting point.

Then install the package we need for parsing email:

```bash
npm install postal-mime
```

I use `postal-mime` here for one job:

```txt
postal-mime → parse incoming raw email
```

Now update `wrangler.toml`.

A simple starting config can look like this:

```toml
name = "email-worker-demo"
main = "src/index.ts"
compatibility_date = "2026-06-08"

[vars]
FROM_EMAIL = "hi@yourdomain.com"
FORWARD_TO_EMAIL = "your-personal-email@example.com"
ADMIN_TOKEN = "change-this-token"

# Optional D1 binding.
# Add this after creating the D1 database.
# [[d1_databases]]
# binding = "DB"
# database_name = "email_worker_demo"
# database_id = "your-d1-database-id"

# Optional Email Sending binding.
# Needed when you want to send email from fetch() using env.EMAIL.send().
# [[send_email]]
# name = "EMAIL"
# allowed_sender_addresses = ["hi@yourdomain.com"]
```

The first Worker can be very small.

At this stage, I only want to prove that the `email()` handler runs.

Create `src/index.ts`:

```ts
interface Env {
  FORWARD_TO_EMAIL?: string
}

export default {
  async email(message, env, ctx): Promise<void> {
    console.log('Email received')
    console.log('From:', message.from)
    console.log('To:', message.to)
    console.log('Subject:', message.headers.get('subject'))
    console.log('Raw size:', message.rawSize)

    // For the first test, forward the email to a verified destination.
    // This keeps the email useful while we are still learning.
    if (env.FORWARD_TO_EMAIL) {
      await message.forward(env.FORWARD_TO_EMAIL)
    }
  }
} satisfies ExportedHandler<Env>
```

This is enough for the first proof.

No parsing yet.

No D1 yet.

No reply yet.

Just:

```txt
incoming email → Worker logs → forward
```

Deploy the Worker:

```bash
npx wrangler deploy
```

### Step 4: Route incoming email to the Worker

Now the Worker exists, but no email address points to it yet.

That is the next connection.

Go back to Cloudflare dashboard:

```txt
Domain
  ↓
Email Routing
  ↓
Routing Rules
  ↓
Create Address
```

Create a custom address like:

```txt
hi@yourdomain.com
```

For the action, choose:

```txt
Send to a Worker
```

Then select the Worker we just deployed:

```txt
email-worker-demo
```

Now the route looks like this:

```txt
hi@yourdomain.com
  ↓
Cloudflare Email Routing
  ↓
email-worker-demo
```

This is the moment where the email becomes programmable.

Before this, the address was only a forwarding rule.

Now it is an entry point into code.

To test it, open the Worker logs in Cloudflare or run local testing later, then send a real email from another account:

```txt
from: your-test-email@gmail.com
to: hi@yourdomain.com
subject: First Email Worker Test
```

If everything is connected correctly, the Worker should log:

```txt
Email received
From: your-test-email@gmail.com
To: hi@yourdomain.com
Subject: First Email Worker Test
```

That is the first real milestone.

We now have an email address that triggers code.

## Read + optional D1

After the Worker receives the email, the next question is:

```txt
What can we read from this message?
```

The Email Worker gives us some simple fields directly:

```txt
message.from
message.to
message.headers
message.raw
message.rawSize
```

That is already useful.

But if we want the actual body, HTML, text, attachments, or structured fields, we need to parse the raw email.

That is where `postal-mime` helps.

### Step 5: Read the incoming message

Update `src/index.ts`:

```ts
import * as PostalMime from 'postal-mime'

interface Env {
  FORWARD_TO_EMAIL?: string
}

function safeHeader(message: ForwardableEmailMessage, name: string) {
  return message.headers.get(name) || message.headers.get(name.toLowerCase()) || ''
}

export default {
  async email(message, env, ctx): Promise<void> {
    console.log('Email received')

    const parser = new PostalMime.default()
    const rawEmail = new Response(message.raw)
    const parsed = await parser.parse(await rawEmail.arrayBuffer())

    const subject = parsed.subject || safeHeader(message, 'subject') || '(no subject)'
    const from = parsed.from?.address || message.from
    const fromName = parsed.from?.name || ''
    const to = parsed.to?.map((item) => item.address).join(', ') || message.to
    const messageId = parsed.messageId || safeHeader(message, 'message-id')

    console.log('From:', from)
    console.log('From name:', fromName)
    console.log('To:', to)
    console.log('Subject:', subject)
    console.log('Message ID:', messageId)
    console.log('Text body:', parsed.text || '')
    console.log('HTML body:', parsed.html || '')
    console.log('Attachments:', parsed.attachments?.length || 0)

    if (env.FORWARD_TO_EMAIL) {
      await message.forward(env.FORWARD_TO_EMAIL)
    }
  }
} satisfies ExportedHandler<Env>
```

Now the Worker is not only reacting to the email.

It can understand the email.

This is the useful difference.

The email is no longer just a thing passing through the system.

It becomes data.

For this first note, I do not want to parse everything. I only care about the basic pieces:

```txt
from
to
subject
text body
html body
message id
created time
```

That is enough to build a small inbox later.

### Step 6: Store the message in D1 — optional

The next step is optional.

If I only want to forward or auto-reply, I do not need a database.

But if I want even a small inbox, I need storage.

For the first version, I would not design a complex email database.

No threading.

No labels.

No attachments.

No search index.

Just one small table.

Create a D1 database:

```bash
npx wrangler d1 create email_worker_demo
```

Cloudflare will return a `database_id`.

Add it to `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "email_worker_demo"
database_id = "your-d1-database-id"
```

Create a simple migration file:

```bash
mkdir -p migrations
```

Create `migrations/0001_create_emails.sql`:

```sql
CREATE TABLE IF NOT EXISTS emails (
  id TEXT PRIMARY KEY,
  from_email TEXT NOT NULL,
  from_name TEXT,
  to_email TEXT NOT NULL,
  subject TEXT,
  text_body TEXT,
  html_body TEXT,
  message_id TEXT,
  raw_size INTEGER,
  status TEXT NOT NULL DEFAULT 'received',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_emails_created_at
ON emails (created_at);

CREATE INDEX IF NOT EXISTS idx_emails_from_email
ON emails (from_email);
```

Apply the migration locally:

```bash
npx wrangler d1 migrations apply email_worker_demo --local
```

Apply it to production when ready:

```bash
npx wrangler d1 migrations apply email_worker_demo --remote
```

Now update the Worker and insert the email.

```ts
import * as PostalMime from 'postal-mime'

interface Env {
  DB?: D1Database
  FORWARD_TO_EMAIL?: string
}

function safeHeader(message: ForwardableEmailMessage, name: string) {
  return message.headers.get(name) || message.headers.get(name.toLowerCase()) || ''
}

async function storeEmail(message: ForwardableEmailMessage, parsed: any, env: Env) {
  if (!env.DB) {
    console.log('D1 is not configured. Skipping storage.')
    return
  }

  const id = crypto.randomUUID()
  const now = new Date().toISOString()

  const subject = parsed.subject || safeHeader(message, 'subject') || '(no subject)'
  const fromEmail = parsed.from?.address || message.from
  const fromName = parsed.from?.name || ''
  const toEmail = parsed.to?.map((item: any) => item.address).join(', ') || message.to
  const messageId = parsed.messageId || safeHeader(message, 'message-id')

  await env.DB.prepare(
    `
    INSERT INTO emails (
      id,
      from_email,
      from_name,
      to_email,
      subject,
      text_body,
      html_body,
      message_id,
      raw_size,
      status,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
  )
    .bind(
      id,
      fromEmail,
      fromName,
      toEmail,
      subject,
      parsed.text || '',
      parsed.html || '',
      messageId,
      message.rawSize || 0,
      'received',
      now
    )
    .run()

  console.log('Email stored in D1:', id)
}

export default {
  async email(message, env, ctx): Promise<void> {
    const parser = new PostalMime.default()
    const rawEmail = new Response(message.raw)
    const parsed = await parser.parse(await rawEmail.arrayBuffer())

    console.log('Email received:', parsed.subject || '(no subject)')

    await storeEmail(message, parsed, env)

    if (env.FORWARD_TO_EMAIL) {
      await message.forward(env.FORWARD_TO_EMAIL)
    }
  }
} satisfies ExportedHandler<Env>
```

This is still small, but now we have the first real inbox foundation.

The Worker receives the email.

The Worker parses it.

The Worker stores a normalized copy.

That is enough for a basic admin panel later.

The important thing is to keep the table boring.

The first table should only answer:

```txt
Who sent this?
Who received it?
What was the subject?
What was the body?
When did it arrive?
```

Everything else can wait.

## Send / reply

Now we have the receiving side.

The next part is sending.

There are two different ideas here:

```txt
send email
reply to incoming email
```

They are close, but not exactly the same.

Sending means the Worker sends a new email.

Replying means the Worker responds to an incoming email event.

For this note, I want to keep both examples small.

### Step 7: Send or reply from Worker code

First, add an email sending binding to `wrangler.toml`.

```toml
[[send_email]]
name = "EMAIL"
allowed_sender_addresses = ["hi@yourdomain.com"]
```

This exposes:

```txt
env.EMAIL.send()
```

inside the Worker.

For safety, I do not want a public `/send` endpoint that anyone can call. So this example uses a simple bearer token.

This is not a full auth system.

It is only enough to protect the demo endpoint.

Update `src/index.ts` and add a `fetch()` handler beside the `email()` handler:

```ts
import * as PostalMime from 'postal-mime'

interface Env {
  DB?: D1Database
  EMAIL?: SendEmail
  FROM_EMAIL: string
  FORWARD_TO_EMAIL?: string
  ADMIN_TOKEN?: string
}

function safeHeader(message: ForwardableEmailMessage, name: string) {
  return message.headers.get(name) || message.headers.get(name.toLowerCase()) || ''
}

function isAuthorized(request: Request, env: Env) {
  if (!env.ADMIN_TOKEN) return false

  const header = request.headers.get('Authorization') || ''
  const token = header.replace('Bearer ', '').trim()

  return token === env.ADMIN_TOKEN
}

async function storeEmail(message: ForwardableEmailMessage, parsed: any, env: Env) {
  if (!env.DB) return

  const id = crypto.randomUUID()
  const now = new Date().toISOString()

  const subject = parsed.subject || safeHeader(message, 'subject') || '(no subject)'
  const fromEmail = parsed.from?.address || message.from
  const fromName = parsed.from?.name || ''
  const toEmail = parsed.to?.map((item: any) => item.address).join(', ') || message.to
  const messageId = parsed.messageId || safeHeader(message, 'message-id')

  await env.DB.prepare(
    `
    INSERT INTO emails (
      id,
      from_email,
      from_name,
      to_email,
      subject,
      text_body,
      html_body,
      message_id,
      raw_size,
      status,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
  )
    .bind(
      id,
      fromEmail,
      fromName,
      toEmail,
      subject,
      parsed.text || '',
      parsed.html || '',
      messageId,
      message.rawSize || 0,
      'received',
      now
    )
    .run()
}

export default {
  async email(message, env, ctx): Promise<void> {
    const parser = new PostalMime.default()
    const rawEmail = new Response(message.raw)
    const parsed = await parser.parse(await rawEmail.arrayBuffer())

    console.log('Email received:', parsed.subject || '(no subject)')

    await storeEmail(message, parsed, env)

    if (env.FORWARD_TO_EMAIL) {
      await message.forward(env.FORWARD_TO_EMAIL)
    }
  },

  async fetch(request, env, ctx): Promise<Response> {
    const url = new URL(request.url)

    if (request.method === 'POST' && url.pathname === '/send') {
      if (!isAuthorized(request, env)) {
        return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
      }

      if (!env.EMAIL) {
        return Response.json(
          { ok: false, error: 'Email sending binding is not configured' },
          { status: 500 }
        )
      }

      let body: any

      try {
        body = await request.json()
      } catch {
        return Response.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 })
      }

      if (!body.to || !body.subject || !body.text) {
        return Response.json(
          { ok: false, error: 'to, subject, and text are required' },
          { status: 400 }
        )
      }

      try {
        const response = await env.EMAIL.send({
          to: body.to,
          from: {
            email: env.FROM_EMAIL,
            name: 'Email Worker Demo'
          },
          subject: body.subject,
          text: body.text,
          html: body.html
        })

        return Response.json({
          ok: true,
          messageId: response.messageId
        })
      } catch (error) {
        console.error('Email sending failed:', error)

        return Response.json({ ok: false, error: 'Email sending failed' }, { status: 500 })
      }
    }

    return Response.json({
      ok: true,
      name: 'email-worker-demo',
      routes: ['/send']
    })
  }
} satisfies ExportedHandler<Env>
```

Now the Worker has two faces.

One face handles incoming email:

```txt
email()
```

The other face handles HTTP requests:

```txt
fetch()
```

That is useful because the same Worker can receive email and expose a small API for testing.

To send a test email:

```bash
curl --request POST "https://email-worker-demo.your-subdomain.workers.dev/send" \
  --header "Authorization: Bearer change-this-token" \
  --header "Content-Type: application/json" \
  --data '{
    "to": "someone@example.com",
    "subject": "Hello from Cloudflare Worker",
    "text": "This email was sent from a Worker."
  }'
```

For a real product, I would not keep it like this.

I would put the send action behind dashboard auth.

I would store the outgoing message first.

I would use a queue.

I would track sent and failed states.

But for this learning note, this is enough.

It proves the core idea:

```txt
Worker can receive email.
Worker can send email.
```

That is the base.

#### Replying directly inside the email event

There is another useful pattern.

When an email arrives, the Worker can reply to that sender from inside the `email()` handler.

For this first note, I would keep the reply simple and use the Email Sending binding.

```ts
interface Env {
  EMAIL: SendEmail
}

export default {
  async email(message, env, ctx): Promise<void> {
    const subject = message.headers.get('subject') || 'Your message'

    await env.EMAIL.send({
      to: message.from,
      from: message.to,
      subject: `Re: ${subject}`,
      text: `Hi,

I received your message.

This is a small automatic reply from a Cloudflare Email Worker.

— Email Worker Demo`,
      html: `
        <p>Hi,</p>
        <p>I received your message.</p>
        <p>This is a small automatic reply from a Cloudflare Email Worker.</p>
        <p>— Email Worker Demo</p>
      `
    })

    if (message.to) {
      console.log('Auto-reply sent from:', message.to)
    }
  }
} satisfies ExportedHandler<Env>
```

This is useful for things like:

```txt
auto-reply
support ticket created
out-of-office message
small confirmation email
```

But I would be careful with it.

Auto-reply can easily become annoying if it is not controlled.

For this note, one reply is enough to understand the feature.

This is not for newsletters.

This is not for marketing.

This is not for sending many emails.

This is for small transactional behavior around incoming email.

### Step 8: Test the full flow

Now the full simple flow is ready.

The test should be boring and clear.

First, test receiving:

```txt
Send email from Gmail or another address
  ↓
to: hi@yourdomain.com
  ↓
Worker receives it
  ↓
Worker logs sender and subject
```

Then test parsing:

```txt
Worker reads:
- from
- to
- subject
- text body
- html body
- message id
```

Then test optional storage:

```txt
Worker inserts a row into D1
```

Then test sending:

```txt
POST /send
  ↓
Worker sends email
  ↓
response includes messageId
```

Then test reply:

```txt
incoming email
  ↓
Worker creates reply
  ↓
sender receives automatic response
```

For local development, Wrangler can also help test Email Workers locally.

Run:

```bash
npx wrangler dev
```

Then you can send a test email payload to the local email handler endpoint:

```bash
curl --request POST "http://localhost:8787/cdn-cgi/handler/email" \
  --url-query "from=sender@example.com" \
  --url-query "to=hi@yourdomain.com" \
  --header "Content-Type: text/plain" \
  --data-raw 'From: "John" <sender@example.com>
To: hi@yourdomain.com
Subject: Testing Email Workers Local Dev
Content-Type: text/plain; charset=utf-8

Hi there from local development.'
```

If the Worker logs the email, the first part is working.

After deployment, I would test with a real email too, because email always has small differences between providers.

A good test checklist:

```txt
[ ] Email Routing is enabled
[ ] Custom address exists
[ ] Custom address routes to Worker
[ ] Worker logs incoming email
[ ] Worker can parse subject/body
[ ] D1 insert works if DB is enabled
[ ] Forwarding works if FORWARD_TO_EMAIL is enabled
[ ] /send endpoint is protected
[ ] Email sending works if EMAIL binding is enabled
[ ] Reply works for a real incoming email
```

If all of those work, the core is done.

We now have the smallest useful email service:

```txt
Receive → Process → Store if needed → Send or Reply
```

That is enough for learning.

And it is also enough to become the base of a small product inbox later.

## What this is not + later

You do not need to run Postfix.

You do not need to maintain a mail server.

You do not need to start with a big support platform.

You do not need to connect the Gmail API on day one.

You can keep the first version inside the Cloudflare ecosystem:

- Email Routing for incoming domain email
- Email Worker for receiving and processing messages
- Worker code for simple logic
- optional D1 storage if you want to keep messages
- Email Sending or reply logic for outgoing messages

For a personal site, small product, internal tool, or owner console, that is already useful.

This is not Gmail.

This is not a full helpdesk.

This is not an IMAP server.

This is not a bulk email platform.

It is a small programmable email service for your own domain.

The first useful version is much simpler:

```txt
Receive → Process → Store if needed → Reply
```

That is the system I want to build first.

After the simple version works, the same idea can grow into a more complete product system.

For Mohetios, that means a private owner inbox where contact form messages and direct domain emails can live together.

A later version could include:

- D1 tables for inbox messages
- a Nuxt dashboard
- cookie-based owner auth
- reply history
- queues for async delivery
- attachments in R2
- search
- labels
- spam scoring
- AI draft suggestions

But those are later steps.

This note is only about the first layer: making email programmable with Cloudflare Workers.

## Closing

The next step is to build the single-Worker version.

The Worker should be able to:

1. receive an incoming email from Cloudflare Email Routing
2. read basic fields like sender, recipient, subject, and body
3. decide what to do with the message
4. optionally store a small copy in D1
5. send or reply to an email from code

That is the best starting point.

Small enough to understand.  
Useful enough to build on.  
Clear enough to turn into a real product later.

The main idea is simple:

```txt
email becomes an event your application can handle
```

The first version is small.

But once this small version works, the rest is only product design:

```txt
dashboard
history
labels
search
replies
notifications
```

That can come later.

For now, I only want the core to be clear.

One domain email.

One Worker.

One programmable flow.

## Source notes

Cloudflare documentation used while checking this note:

- Email Routing overview: https://developers.cloudflare.com/email-routing/
- Email Workers: https://developers.cloudflare.com/email-routing/email-workers/
- Email Workers runtime API: https://developers.cloudflare.com/email-routing/email-workers/runtime-api/
- Email Workers local development: https://developers.cloudflare.com/email-routing/email-workers/local-development/
- Email Service Workers API: https://developers.cloudflare.com/email-service/api/send-emails/workers-api/
- Email Service pricing: https://developers.cloudflare.com/email-service/platform/pricing/
- D1 migrations: https://developers.cloudflare.com/d1/reference/migrations/
- D1 prepared statements: https://developers.cloudflare.com/d1/worker-api/prepared-statements/
