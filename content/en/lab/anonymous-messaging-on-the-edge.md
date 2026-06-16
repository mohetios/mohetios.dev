---
title: 'Nekonymous: from a small anonymous relay to a first real architecture'
description: A lab note about Nekonymous, a Persian-first anonymous Telegram relay moving from a compact Cloudflare Workers, KV, and Durable Objects MVP toward a first version with clearer data ownership, ticket-based message handling, structured storage, and a future compatibility matching layer.
thumbnail: /content/nekonymous-cover.webp
date: 2024-08-19
updated: 2026-06-16
status: Lab project
featured: true
tags:
  - cloudflare-workers
  - privacy
  - telegram
  - durable-objects
  - encryption
  - edge-architecture
  - product-ethics
  - ai-matching
---

Nekonymous started from a small idea: build an anonymous messaging bot for Telegram without turning it into a full messaging platform.

A user starts the bot, receives a personal Telegram link, and shares it wherever they want. Someone else opens that link and sends a message without seeing the Telegram username behind the link. The owner reads pending messages through `/inbox`, replies from inside the bot, blocks senders when needed, pauses new link-based messages, and gives private nicknames to repeated senders.

That is the visible product.

The lab question sits around it: how small can an anonymous relay remain while still having abuse controls, minimizing stored sensitive data, and being honest about what privacy it can and cannot provide?

Project links:

- [mehotkhan/Nekonymous](https://github.com/mehotkhan/Nekonymous)
- [nekonymous.alizemani.ir](https://nekonymous.alizemani.ir/)

## The original question

The question behind Nekonymous was not “how do I build a Telegram bot?”

The more useful question was:

> Can I build a hosted anonymous relay that reduces visible identity leakage, avoids keeping message bodies as plaintext in storage, and still stays small enough to operate, explain, and maintain?

That distinction matters.

An anonymous bot can easily become a page of vague privacy promises. I did not want Nekonymous to work that way. If Telegram receives the original message, if the Worker sees plaintext while processing the update, and if runtime secrets are part of the trust boundary, the product should say that clearly.

So the security goal was smaller and more honest from the beginning:

> Reduce stored plaintext and visible identity leakage without slowing the relay down or making operations unnecessarily complex.

That is still the core of the project.

## Current state

The current version of Nekonymous is a working, intentionally small MVP.

The architecture is compact:

```txt
Telegram
  -> POST /bot on a Cloudflare Worker
  -> Grammy handlers
  -> KV for profile, link map, stats, and encrypted blobs
  -> SQLite-backed Durable Object inbox per recipient
  -> inbox reading through /inbox
```

The Worker is the only HTTP entry point. It receives the Telegram webhook, routes `/start`, `/inbox`, settings, incoming messages, and inline callbacks, and performs the main validation, crypto, and Telegram routing work.

KV currently has several roles: user profiles, public-link-to-owner mapping, simple mutable state such as pause/block/nickname/draft, approximate stats, and encrypted conversation blobs. Each recipient has a SQLite-backed Durable Object inbox so pending messages can be ordered, capped, and delivered through `/inbox`.

That architecture was correct for the MVP because the first version had to answer practical product questions:

- Does the anonymous link flow make sense?
- Do users understand `/inbox` and reply?
- Are block, pause, and nickname enough for the first abuse controls?
- Can the privacy copy stay honest?
- Can the message payload be removed from storage after delivery?

The answer so far is yes. But the MVP has reached its natural boundary.

## Why the architecture needs to change

The problem is not that KV or Durable Objects were bad choices. The problem is that some state grew beyond the place where it should live.

In the current version, KV is used for routing, profile data, some mutable user state, and encrypted conversation blobs. That was acceptable early on, but it is not the right shape for a more serious first version.

There are four reasons.

1. **KV is good for read-heavy lookups, not hot mutable state.**
   Link mapping and configuration fit KV well. Drafts, block lists, callback references, rate limits, and inbox state need local coordination.

2. **Ticketing needs one clear authority.**
   When a message exists both as a KV conversation blob and as a Durable Object inbox row, the mental model becomes harder. A ticket should live in one authoritative place.

3. **Outbound Telegram delivery should be separated from the request path.**
   Non-essential notifications should not keep the webhook request busy. Telegram output is rate-limited, and bot sends should be idempotent and retryable.

4. **The next layer needs profiles and matching.**
   Personality and compatibility matching need relational records, consent, profile versions, and queryable storage. KV is not the right primary store for that.

The first real version should move from “MVP storage” to clear storage ownership.

## The path to V1

V1 should not make the system complex for its own sake. Every component has to earn its place.

The target architecture is:

```txt
Telegram
  -> Bot Worker
  -> UserStateDO:{userId}
  -> D1 Core
  -> KV Routing Cache
  -> Telegram Outbox Queue
  -> TelegramOutboxDO
  -> Telegram API
```

In this model:

- The Worker validates and routes webhook updates.
- `UserStateDO` owns each user’s hot state.
- D1 is the source of truth for identity, links, reports, consents, profiles, and match records.
- KV is only a routing and configuration cache.
- A Queue separates Telegram sends from the request path.
- `TelegramOutboxDO` keeps outgoing sends idempotent and rate-limited.

This is where Cloudflare’s primitives become useful for the actual shape of the system: Durable Objects for coordinated state, D1 for relational data, KV for fast lookup, and Queues for work that should not block a webhook request.

## The new ticketing core

In V1, every anonymous message is a ticket.

A ticket is not just the message body. It is an operational reference that lets the recipient act on the same anonymous connection: reply, block, report, or assign a nickname.

The new model:

```txt
UserStateDO:{recipientUserId}
  -> inbox_tickets
       ref
       ticket_id
       sender_user_id
       recipient_user_id
       conversation_id
       payload_ciphertext
       connection_ciphertext
       status
       delivered_at
       replied_at
       reported_at
       blocked_at
       expires_at
```

There are two important identifiers:

| Identifier | Role |
| --- | --- |
| `ticket_id` | Long random internal identifier used for crypto context and tracking |
| `ref` | Short callback reference that only has meaning inside the recipient’s inbox |

Telegram callback data stays short:

```txt
r:{ref}   reply
b:{ref}   block
rp:{ref}  report
n:{ref}   nickname
```

No sensitive metadata is stored in the callback itself. When a user presses a button, the Worker receives the ref and resolves it inside that user’s `UserStateDO`. If the ref does not belong to that user, the action is rejected.

That is simpler and safer than keeping callback state in KV.

## Data ownership

In V1, each type of data should have exactly one primary owner.

| Data | Primary owner | Why |
| --- | --- | --- |
| Telegram user hash | D1 + KV cache | Fast lookup and stable identity |
| Encrypted chat id | D1 | Needed for delivery and internal audit |
| Public link | D1 + KV cache | Queryable source of truth plus fast lookup |
| Active draft | UserStateDO | Mutable per-user state |
| Pause/block state | UserStateDO | Hot path checks when receiving messages |
| Inbox tickets | UserStateDO | Ordering, bounded queue, and callback ownership |
| Contact labels | UserStateDO | Private per-recipient metadata |
| Conversation summary | D1 | Lightweight index and counters, not message history |
| Report | D1 | Audit and moderation |
| Bot copy/config | KV or local files | Read-heavy data |
| Outbound notification | Queue + OutboxDO | Retry, idempotency, and rate limiting |

The rule is simple:

```txt
KV is for routing and cache.
D1 is for queryable source of truth.
Durable Objects are for hot coordinated state.
Queues are for work that should not block the request.
```

## Encryption architecture

Nekonymous still should not claim end-to-end encryption.

It is a hosted relay built on Telegram. Telegram sees the original message. The Worker sees the message body while processing the update. The runtime operator and runtime secrets are part of the trust boundary.

So the goal of crypto is not to remove the operator from the trust model. The goal is to:

- avoid storing message bodies as plaintext,
- make raw storage leaks less useful without the key,
- delete message payloads after delivery,
- retain only the metadata required for actions,
- bind ciphertext to the intended ticket and recipient context.

The proposed model:

```txt
APP_MASTER_KEY
  -> HKDF-SHA-256(ticket_id, purpose)
  -> AES-256-GCM key

payload_ciphertext:
  the message body, temporary, cleared after delivery

connection_ciphertext:
  metadata needed for reply/block/report/nickname, encrypted and TTL-bound
```

Each encryption operation uses a random 96-bit IV. The ciphertext envelope should include a version and key id so key rotation remains possible. AAD should bind context such as purpose, ticket id, sender, recipient, and schema version so ciphertext cannot be moved between contexts silently.

Conceptual envelope:

```txt
v1.k1.iv.ciphertext
```

This is not a complicated crypto design, but it avoids several mistakes: unnecessary long-term payload storage, callback metadata in buttons, context-free ciphertext, and unclear key separation.

## Message lifecycle in V1

### 1. User start

```txt
/start
  -> resolve Telegram user
  -> hash Telegram id with HMAC pepper
  -> lookup in KV
  -> fallback to D1
  -> if new user:
       create D1 user
       create public link
       initialize UserStateDO
       cache KV mappings
  -> if no locale:
       show language picker
  -> if onboarding is complete:
       show personal link
```

For multilingual support, the user’s locale is stored in both D1 and `UserStateDO`. Telegram’s `language_code` may suggest a default, but the final choice should be explicit.

### 2. Opening an anonymous link

```txt
/start {slug}
  -> resolve link from KV
  -> fallback to D1
  -> reject self-message
  -> recipient UserStateDO.checkCanReceive(sender)
  -> sender UserStateDO.setDraft(toUserId)
  -> ask sender to write a message
```

No ticket is created yet. A ticket only exists after the actual message arrives.

### 3. Sending an anonymous message

```txt
sender sends text
  -> load draft from sender UserStateDO
  -> rate-limit sender
  -> check recipient pause/block/inbox cap
  -> create ticket_id and ref
  -> encrypt payload
  -> encrypt connection metadata
  -> insert inbox_ticket in recipient UserStateDO
  -> clear sender draft
  -> upsert D1 conversation summary
  -> enqueue recipient notification
```

New messages no longer go into a KV conversation store. The recipient’s inbox ticket is the authority.

### 4. Reading the inbox

```txt
/inbox
  -> list pending tickets from recipient UserStateDO
  -> decrypt payloads
  -> render bot envelope in recipient locale
  -> send messages with action buttons
  -> mark delivered
  -> payload_ciphertext = NULL
  -> keep connection_ciphertext until TTL
```

User-generated message text is not translated. Only the bot envelope is rendered in the recipient’s locale.

### 5. Acting on a ticket

For reply, block, report, and nickname:

```txt
callback {action}:{ref}
  -> resolve current user
  -> UserStateDO.getTicket(ref)
  -> verify ownership
  -> decrypt connection metadata
  -> run action
```

A callback is not trusted just because it came from Telegram. Ticket ownership is always verified inside the current user’s `UserStateDO`.

## Queue and outbox

Only one queue is needed for the V1 core:

```txt
telegram-outbox
```

All non-essential notifications follow this path:

```txt
Worker
  -> telegram-outbox queue
  -> TelegramOutboxDO
  -> Telegram API
```

`TelegramOutboxDO` does three things:

1. Prevents duplicate sends with an `idempotency_key`.
2. Applies global and per-chat send limits.
3. Handles Telegram send errors such as `retry_after`.

This component is necessary because Telegram output is the real bottleneck for a bot. The Worker can ingest updates quickly, but outbound delivery must be calm, controlled, and idempotent.

## Multilingual behavior

V1 should be locale-aware from the beginning.

The model is simple:

```txt
first /start
  -> language picker
  -> save locale
  -> all bot UI uses the user locale
```

Important rule:

```txt
User-generated text is not automatically translated.
Bot-generated wrappers and buttons are rendered in the recipient’s locale.
```

For example, if a Persian sender writes to an English recipient, the message stays Persian, but the bot wrapper is English:

```txt
Anonymous message:

سلام، حالت چطوره؟

[Reply] [Block] [Report]
```

For the future matching layer, locale should also be part of profile and candidate filtering. In V1, matches should happen between users who share an accepted language unless a separate translation mode is added later.

## The test and matching layer

After the core refactor, Nekonymous can add a new layer: anonymous personality-based matching.

This is not psychological diagnosis. It is not therapy. It is a compatibility layer for suggesting more meaningful anonymous conversations.

The proposed model:

```txt
60-question compatibility test
  -> trait scores
  -> communication style
  -> values/interests
  -> boundaries
  -> consent
  -> D1 profile record
  -> optional semantic embedding
  -> match suggestions
```

The assessment should be inspired by continuous trait models such as HEXACO or IPIP-style Big Five/HEXACO-like scales, not rigid entertainment labels. The system needs scores and compatibility signals, not hard identity boxes.

In V1, the final score should be deterministic. AI can generate summaries and explanations, but it should not be the primary decision-maker.

Rule:

```txt
Code scores.
Safety filters decide permission.
AI explains.
Consent opens conversation.
```

## What is intentionally not included

To avoid unnecessary complexity, the first version does not include:

- payments,
- wallet or Telegram Stars,
- subscriptions,
- a full social network,
- real-time chat rooms,
- a separate ConversationDO,
- a separate DedupeShardDO,
- R2 archives,
- a heavy analytics pipeline,
- automatic translation of message bodies,
- end-to-end encryption claims,
- an official dating mode.

These may become useful later. They do not improve the core right now.

## Tradeoffs

Several tradeoffs remain.

**Telegram is part of the trust boundary.**
This cannot be removed while the product lives inside Telegram.

**The Worker sees plaintext during processing.**
At-rest encryption is useful, but it is not end-to-end encryption.

**Connection metadata remains after delivery.**
Reply, block, report, and nickname need it. It must be encrypted and TTL-bound.

**D1 conversation summaries do not contain message bodies.**
That is intentional. It is enough for lightweight indexing and moderation, but not for full message history.

**UserStateDO is per user, not per conversation.**
That is simpler and enough for V1. If Nekonymous later becomes a real-time chat product, a ConversationDO may become necessary.

## Done criteria for the V1 architecture

The refactor is complete when:

- KV is no longer the authority for messages or hot user state.
- New messages are written to `UserStateDO.inbox_tickets`.
- `/inbox` reads from `UserStateDO`.
- Message payload is cleared after delivery.
- Reply, block, report, and nickname always verify ticket ownership.
- D1 stores users, links, reports, and conversation summaries.
- KV is only routing/cache.
- Notifications go through the outbox queue.
- Webhook secret verification and idempotency are enforced.
- The user locale is stored from the first start.
- The privacy copy remains honest.

## Closing

Nekonymous is not trying to be the largest anonymous messaging system. Its value is in staying small and precise.

The current version proved that a small anonymous relay on Telegram can be useful. The first real version should make that idea more serious: clearer data ownership, safer ticketing, controlled outbound delivery, and a clean path toward personality-based matching.

The architecture follows a few simple rules:

```txt
Every message is a ticket.
Every ticket lives in the recipient’s inbox.
Payload is temporary.
Connection metadata is encrypted and TTL-bound.
KV is only cache.
D1 is queryable source of truth.
Durable Objects own hot state.
Queues are used only when the request should not wait.
```

That is the direction I want Nekonymous to take: claim less, define more, and keep the system small enough to explain.
