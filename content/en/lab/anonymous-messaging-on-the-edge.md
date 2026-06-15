---
title: "Lab Note: Nekonymous as a Small Anonymous Relay"
description: A technical and product note on Nekonymous, a Persian-first hosted anonymous Telegram relay built with Cloudflare Workers, KV, SQLite-backed Durable Objects, and an honest privacy boundary.
date: 2024-08-19
updated: 2026-06-15
status: Refining
tags:
  - cloudflare-workers
  - privacy
  - telegram
  - durable-objects
  - encryption
  - edge-architecture
  - product-ethics
---

## Question

How can I build a small anonymous messaging tool without pretending it solves every privacy problem?

That was the useful question behind Nekonymous.

Not: how do I make a Telegram bot?

Not: how do I make the strongest possible security claim?

Not: how do I build a full messaging platform?

The sharper question is smaller and more practical: can a hosted relay reduce user-visible identity leakage, keep message bodies out of plaintext storage, and still stay simple enough to operate?

Nekonymous is my current answer to that question.

Project references:

- [Nekonymous project page](/projects/nekonymous)
- [mehotkhan/Nekonymous](https://github.com/mehotkhan/Nekonymous)

## Context

Anonymous messaging has a familiar product shape.

A person gets a link. Someone else opens it. A message arrives without a visible name.

That shape is easy to understand, especially in a Telegram-heavy user culture. The friction is low. People already know how to start a bot, send text, send media, and read replies. For a Persian-first project, Telegram is a practical surface.

But anonymous messaging also carries risk.

Distance can help someone speak honestly. The same distance can help someone behave badly. The system needs recipient controls, block flows, pause mode, rate limits, and a careful explanation of what anonymity means.

That last part matters most.

If the interface says "anonymous" and the architecture quietly depends on Telegram, an operator, runtime secrets, and routing metadata, then the product has to explain the boundary. Otherwise the UI teaches the wrong mental model.

## Product Boundary

Nekonymous is a social/privacy tool, not only a bot.

The bot is the interface. The product is the relay.

Each user gets a personal Telegram deep link. A sender opens that link and writes a message. The recipient reads pending messages from `/inbox`. The recipient can reply through the bot, block or unblock the sender, pause new link-based messages, and add a private nickname for repeat senders.

The system deliberately stops before becoming several other things:

Not a social network.

Not a helpdesk.

Not a full encrypted messenger.

Not a moderation platform.

Not a complex app with a separate frontend.

That boundary keeps the implementation honest. It also makes the abuse and privacy questions easier to review because the state surface stays small.

## Privacy Boundary

Nekonymous is a hosted anonymous relay.

It is not end-to-end encrypted.

The bot protects against one important product-level leak: senders and recipients do not see each other's Telegram username through the normal bot UI. Message bodies are encrypted before they are stored in KV or Durable Object storage. A storage-only attacker with access to KV and DO rows, but without `APP_SECURE_KEY`, cannot decrypt message bodies. After `/inbox` delivery, the plaintext payload is cleared from KV. Only encrypted connection metadata remains so reply, block, and nickname callbacks can continue to work.

That is useful.

It is also limited.

Telegram still receives the original messages because this is a Telegram bot. The Worker sees plaintext while processing a message. A Cloudflare or operator account that can change Worker code or access runtime secrets can compromise future messages. An operator with `APP_SECURE_KEY` plus stored `ticketId` and ciphertext can decrypt stored conversations. Some metadata is intentionally plaintext: user records, public link UUID maps, block lists, paused state, private nickname maps, and active draft state.

For me, the honest security goal is:

> Minimize stored plaintext and user-visible identity leakage while keeping the relay fast and operationally simple.

That sentence is less exciting than a vague privacy promise. It is also much safer.

## Architecture

The architecture is intentionally small.

```txt
Telegram
  -> POST /bot on one Cloudflare Worker
  -> Grammy handlers
  -> KV for profiles, link maps, stats, encrypted blobs
  -> one SQLite-backed Durable Object inbox per recipient
  -> recipient reads through /inbox
```

The Worker is the only HTTP entry. It serves the small public pages and receives the Telegram webhook. Grammy handles `/start`, `/inbox`, settings, incoming messages, and inline callbacks. KV stores user records, UUID-to-user maps, approximate stats, and opaque AES-GCM ciphertext under `conversation:{conversationId}`. A recipient's inbox lives in a Durable Object addressed by their Telegram user ID.

There is no SPA, no D1, no Queue, and no second Worker in Nekonymous.

That is not because those tools are bad. D1 and Queues are useful in the right system. They are not needed for this one yet. Adding them would create more operational surface without improving the central relay promise.

The main design rule is simple: each kind of state should live where its consistency needs make sense.

User profile state can tolerate KV's eventual consistency. Inbox ordering cannot. Message bodies should be encrypted wherever they rest. Callback refs should be short, opaque, and scoped to the recipient's inbox.

## Why Durable Objects

The inbox is the one place where ordering and coordination matter.

KV is a bad authority for that. It is eventually consistent, and an inbox should not depend on racing full-record rewrites when two people send messages near the same time.

So Nekonymous uses one SQLite-backed Durable Object per recipient.

The object is addressed like this in the Worker:

```txt
INBOX_DO.idFromName(recipientTelegramId)
```

Inside that object, a small SQLite table stores inbox entries:

| Field | Purpose |
| --- | --- |
| `ref` | short callback reference for reply, block, unblock, nickname |
| `ticket_id` | random 256-bit ticket used as HKDF salt |
| `conversation_id` | derived KV key suffix |
| `ciphertext` | encrypted payload copy while pending |
| `delivered` | pending or delivered state |
| `created_at` | ordering and pruning |

The inbox is capped at 50 rows. Before rejecting a new message, the DO prunes old delivered callback refs. If all 50 rows are still pending, the sender gets the inbox-full message and the newly written KV ciphertext is removed.

That cap is product design as much as storage design. Anonymous systems need bounded failure modes.

## Why KV

KV is used where its shape fits.

`user:{telegramId}` stores the user profile, display name, personal UUID, block list, pause state, private nickname map, and active draft. `userUUIDtoId:{uuid}` maps a public link token to the owner Telegram ID. `conversation:{conversationId}` stores opaque AES-GCM ciphertext as text, not JSON. Stats are stored as daily and running counters, and they are approximate.

The approximate part is intentional. KV read-modify-write counters can lose increments under concurrency. For a public homepage counter, that is acceptable. For billing, audit, or exact product analytics, it would not be.

This is the pattern:

```txt
KV: simple lookup records and encrypted blobs
DO: recipient inbox ordering
Worker: validation, crypto, Telegram routing
```

That is enough for the current product.

## Message Lifecycle

The lifecycle is short, but each step has a reason.

1. A user runs `/start` and receives a personal Telegram link.
2. A sender opens `/start {uuid}` from that link.
3. The system validates the link shape, resolves the owner, rejects self-message attempts, checks block status, and checks paused state.
4. The sender composes a message.
5. Server-side checks run again before accepting the message.
6. Unsupported payloads are rejected before encryption.
7. A conversation object is created with connection metadata and payload.
8. The system creates a fresh random 256-bit `ticketId`.
9. HKDF derives the AES key and `conversationId` from `APP_SECURE_KEY` and the ticket.
10. AES-GCM encrypts the conversation JSON with a random 12-byte IV.
11. The ciphertext is saved to KV and copied into the recipient Durable Object inbox.
12. The recipient sees a pending count and later runs `/inbox`.
13. Pending DO rows are decrypted and delivered through Telegram.
14. The sender receives a best-effort seen notification.
15. KV is re-encrypted with the same connection metadata but an empty payload.
16. The DO row is marked delivered and its ciphertext is set to `NULL`.
17. Reply, block, unblock, and nickname callbacks continue using `ref`, `ticketId`, and `conversationId`.

The important detail is step 15.

After delivery, the system still needs routing metadata. It does not need the message body in storage. Separating payload from connection metadata keeps the relay useful without keeping more plaintext-equivalent data than needed.

## Security Decisions

The crypto design is ticket-based.

Each accepted message gets a fresh random ticket generated with `crypto.getRandomValues(32)`. The ticket is not a password. It is used as the HKDF salt with `APP_SECURE_KEY` as input key material.

HKDF info labels separate the derived values:

| Derived value | Label |
| --- | --- |
| AES key | `nekonymous:aes:v1` |
| Conversation ID | `nekonymous:conversation:v1` |
| Sender alias | `nekonymous:label:v1:{senderId}` |

AES-GCM uses a 12-byte random IV per encryption. The stored ciphertext format is:

```txt
{iv_base64url}.{ciphertext_base64url}
```

`APP_SECURE_KEY` must have at least 32 bytes of entropy in production. The implementation uses the Web Crypto API, not Node `crypto`, which keeps it compatible with Cloudflare Workers.

Callback authorization is also part of the security model. When a user clicks reply, block, unblock, or nickname, the handler resolves the short `ref` in that user's inbox DO, loads the encrypted conversation from KV, decrypts it with the stored ticket, and verifies that `conversation.connection.to` matches the current Telegram user.

The callback is not trusted just because the button exists.

## Tradeoffs

The system keeps some tradeoffs on purpose.

KV profile updates are read-modify-write and eventually consistent. For this small bot, that is acceptable. If settings and block edits became highly concurrent, a stronger authority would be needed.

Stats are approximate. They are public product counters, not exact accounting.

Encrypted connection metadata remains after delivery so callbacks can work. Removing it would require a different reply/block/nickname index.

Old delivered callback refs can expire when the 50-row inbox cap prunes them. That is acceptable because the inbox needs a bounded shape.

Telegram remains part of the trust boundary. This cannot be fixed inside a Telegram bot.

Operator trust remains part of the model. This cannot be honestly described away.

## What I Would Improve Next

The next improvements are practical, not architectural theater.

- Make the bot username fully configuration-driven everywhere.
- Finish production social metadata for the public pages.
- Add better abuse controls without collecting unnecessary identity.
- Write self-hosting notes that explain `APP_SECURE_KEY`, Telegram webhook setup, KV, and Durable Object migrations.
- Improve observability without logging message bodies, ticket IDs, Telegram tokens, or runtime secrets.
- Consider D1 or a stronger DO-based data model only if usage grows enough to justify it.

The system should earn complexity before it receives it.

## Closing

Anonymous tools should be designed with explicit boundaries, not vague promises.

For Nekonymous, that means the privacy model is part of the product. The architecture is small because the claim is small. The storage model is bounded because the risk is real. The copy should say what the system protects and what it does not.

That is the lesson I want to keep from this project.
