---
title: Nekonymous
description: Nekonymous is a Persian-first open-source Telegram bot for personal anonymous links, sealed anonymous messages and replies, privacy controls, and optional conversation suggestions, built around independent sealed tickets on Cloudflare.
thumbnail: /content/nekonymous-lab.webp
date: 2026-07-15
updated: 2026-07-16
status: Active
featured: true
tags:
  - anonymous-messaging
  - telegram-bot
  - cloudflare-workers
  - privacy
  - sealed-capabilities
  - durable-objects
repo: https://github.com/mohetios/Nekonymous
website: https://mohetios.github.io/Nekonymous/
---

Nekonymous is a Persian-first anonymous Telegram bot for personal links, anonymous messages, anonymous replies, and opt-in conversation starts without exposing both sides to each other in the normal product flow.

The main question was not only whether users could hide their Telegram identity from each other. The sharper question was how much data the system itself really needs to keep in order to deliver a message.

Neko turns each message into an **independent sealed ticket** instead of a permanent row connected to a sender and a recipient. The payload stays encrypted until delivery, then it is cleared from Neko storage after successful delivery. The limited route needed for reply, block, report, and private nickname actions remains only until ticket expiry.

The first version of Nekonymous is Telegram-only. The website introduces the project and documentation, but the bot remains the main product surface.

Paths:

- [Open-source repository](https://github.com/mohetios/Nekonymous)
- [Project intro page](https://mohetios.github.io/Nekonymous/)
- [Telegram bot](https://t.me/nekonymous_bot)
- [Build story](https://mohetios.dev/en/blog/building-nekonymous-anonymous-telegram-bot)
- [Technical architecture lab](https://mohetios.dev/en/lab/nekonymous-anonymous-messaging-technical-lab)

## Why It Exists

An anonymous message bot looks small from the outside:

```txt
someone sends a message
-> the bot resolves the owner of the link
-> the message reaches that person
```

But the direct implementation of that flow often turns into a searchable database of users, messages, and relationships:

```txt
sender_id
recipient_id
message_body
conversation_id
created_at
```

Even if the message body is encrypted, that model can still show who contacted whom, how often, and for how long.

Nekonymous came from this question:

> Can an anonymous Telegram bot deliver the message without becoming the owner of a coherent archive of private user relationships?

The goal was not to build the "most secure anonymous messenger" or promise that every trace disappears. The goal was narrower and more practical: store less data, break direct joins between storage planes, and describe the remaining trust boundaries honestly.

## What It Explores

Nekonymous combines a few product and engineering problems.

### Anonymous Messages Without A Permanent Transcript

Every message has its own capability, blind lookup, encrypted payload, and limited route. A reply is not a continuation of a permanent conversation row. It becomes a new ticket.

### Inbox As A Delivery Queue

Neko's inbox is not a history archive. Unread items are kept only until delivery. After Telegram accepts the delivered message, the payload is cleared and the unread pointer is deleted.

### Abuse Controls With Less Joinable Data

Block, report, and Safety sanctions still need to work, but they should not require a readable social graph. Neko uses blind tags and limited state for blocking and abuse tracking.

### Conversation Suggestions Without Fit Claims

Users can complete a 25-question assessment that builds a limited profile of their conversation style and what they currently want from a conversation. Discoverability is off until the user explicitly enables it.

The current Telegram flow puts assessment progress, discoverability, profile summary, and suggestion readiness in one hub. Progress can be saved and resumed. Starting a retake turns discoverability off, and the find action stays unavailable until both profile vectors exist and indexing has been verified.

Vectorize retrieves bounded initial candidates. Final ranking is deterministic TypeScript. The system does not expose a fit percentage, diagnose personality, or decide automatically who should talk to whom.

### Privacy With Clear Boundaries

Neko is not E2EE or zero-knowledge. Telegram and the Worker see plaintext while a message is being processed. Encryption in this project reduces stored plaintext and the value of a storage dump; it does not remove the processing trust boundary.

## How It Works

The core messaging flow stays simple:

```txt
personal link
-> compose message
-> create independent ticket
-> store encrypted route and payload
-> store temporary unread in UserState
-> notify recipient
-> deliver from inbox
-> clear payload
-> keep limited actions until expiry
```

The architecture runs on one Cloudflare Worker, with each storage plane holding a specific part of the picture:

```txt
Telegram Bot API
        |
        v
Cloudflare Worker + grammY
        |
        |-- D1
        |   users, public links, aggregate statistics
        |
        |-- Durable Objects
        |   user state, tickets, safety, profiles,
        |   conversation requests, and Telegram Outbox
        |
        |-- KV
        |   best-effort cache and routing
        |
        |-- Queues
        |   inbox delivery, notifications, stats, profile indexing
        |
        |-- Vectorize
        |   bounded conversation candidate retrieval
        |
        `-- Web Crypto
            HMAC, HKDF, and AES-GCM
```

The public source tree mirrors those boundaries with shallow product folders directly under `src/`: `identity/`, `ticketing/`, `profile/`, `suggestions/`, and the other runtime areas. Shared types and Durable Object clients stay visible in flat `types/` and `storage/` folders. The July 16, 2026 source cleanup changed navigation and import paths, not the runtime model.

D1 is the relational source for account structure, public links, and aggregate statistics. It does not store anonymous message bodies or a direct anonymous sender-recipient graph.

Durable Objects own state that needs local ordering, leases, transactions, or coordination. KV is cache only; the main path must still work through authoritative storage when KV misses.

Queues move retryable work out of the user-facing path. Because Queue delivery is at least once, sensitive operations such as Telegram delivery, inbox delivery, and request acceptance are designed to be idempotent.

Every ticket has a 32-byte capability. One part derives the blind lookup; the other derives independent keys for route, payload, and metadata. The raw capability is never stored in TicketVault, and ticket actions require both the capability and the recipient's current account ownership.

That means a hard reset does more than rotate a public link. By creating a new internal account, it invalidates callbacks from old delivered tickets.

## What I Learned

The central lesson was that privacy is not only an encryption problem.

A system can encrypt message text correctly and still preserve the relationship graph in a readable storage model. The opposite failure is also possible: a system can minimize data, but a bad retry or aggressive cleanup path can lose healthy messages.

In this project, privacy, correctness, and reliability are tied together.

The main rules that became clearer:

- data that is never stored does not need later protection or deletion;
- encrypting text is not enough if route and metadata stay directly joinable;
- Queues should not be treated as exactly once;
- temporary failure must not destroy healthy data;
- real reset needs to break the previous operational identity;
- conversation suggestions should be consent-first and avoid psychological claims;
- open source does not guarantee security, but it makes review possible;
- privacy documentation has to match what the code actually does.

For me, Neko was not only an exercise in building a Telegram bot. It was a way to follow a small product problem down into storage contracts, threat modeling, failure semantics, UX copy, and public release boundaries.

## Current Status

The first version of Nekonymous has been tested and is ready for public release.

The supported `master` line includes:

- personal anonymous links;
- text and supported Telegram media;
- independent sealed tickets;
- bounded delivery inbox;
- fresh unread notifications with live counts;
- anonymous replies;
- private nicknames;
- block and unblock;
- blind reporting and automated Safety sanctions;
- pause and resume for incoming messages;
- hard account reset;
- conversation style profile;
- unified profile and Suggestions hub with saved progress and verified readiness;
- optional conversation suggestions;
- accept-gated conversation requests;
- TelegramOutbox with pacing and idempotency;
- aggregate statistics without scanning user vaults;
- tests and audits for storage boundaries, retry, reset, and logging.

Nekonymous is still a hosted relay. It trusts Telegram, Cloudflare, and the project operator. That limit is stated consistently in the README, Threat Model, technical lab, and bot copy.

## Next Steps

- publish the first public release;
- keep the project page, build story, lab note, README, and Telegram bot copy synchronized with `master`;
- observe real inbox, Queue, and Outbox behavior after users arrive;
- collect feedback on the cat-language copy, privacy controls, and conversation suggestions;
- evaluate abuse patterns before adding heavier moderation tools;
- document provenance and better ways to keep the public code close to the deployed version;
- open the next version's scope from real usage and feedback, not from adding features before release.

The first version is not the end of this problem. It is a small, runnable, reviewable answer to one question:

> How can an anonymous messaging system do its job without learning more than it needs to know about people and their conversations?
