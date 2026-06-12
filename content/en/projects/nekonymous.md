---
title: Nekonymous
description: A project note on Nekonymous - a Persian-first anonymous Telegram messaging experiment built with Cloudflare Workers and Durable Objects.
date: 2024-08-19
updated: 2025-04-29
status: Prototype
tags:
  - cloudflare-workers
  - telegram
  - privacy
  - durable-objects
  - anonymous-messaging
repo: https://github.com/mehotkhan/Nekonymous
website: https://nekonymous.alizemani.ir/
---

Nekonymous is a Persian-first anonymous messaging experiment for Telegram. A user starts the bot, receives a unique link, and shares that link with others. People who open it can send a message without exposing their Telegram identity to the recipient.

The project is not interesting only because the messages are anonymous. The harder part is the product boundary around anonymity: replies, blocking, abuse controls, routing state, encryption at rest, and the question of what a recipient should be allowed to know.

Repository:

- [mehotkhan/Nekonymous](https://github.com/mehotkhan/Nekonymous)
- [nekonymous.alizemani.ir](https://nekonymous.alizemani.ir/)

## Why It Exists

Anonymous messaging looks simple from the outside.

One person sends.  
Another person receives.  
No name is shown.

But a real relay has to answer more careful questions. Can the recipient reply? Can the sender be blocked? What happens when a link is abused? Which identifiers must exist for routing, and which ones should never become part of the visible product?

Nekonymous was a compact way to study those questions inside a familiar Iranian user surface: Telegram.

## What It Explores

The project explores anonymous messaging as a hosted relay, not as a full end-to-end encrypted messaging system.

That distinction matters. Messages can be encrypted in storage and handled carefully by the worker, but the system still has to process Telegram webhook traffic, route messages, and keep enough state to make the bot usable. Privacy promises should stay honest.

## How It Works

The implementation uses Cloudflare Workers as the edge runtime and Durable Objects for coordinated state around users or conversations. Telegram webhooks enter the Worker, the Worker validates expected traffic, and the bot flow decides whether to create links, relay messages, route replies, or apply recipient controls.

At a high level, the system has to manage:

- unique public links,
- anonymous inbound messages,
- recipient reply flows,
- sender blocking,
- abuse limits,
- encrypted message storage,
- webhook validation.

The public page should stay at this level. Exact anti-abuse rules and sensitive implementation details do not need to be published.

## What I Learned

Privacy features are product features before they are technical features.

If the UI lets people believe something stronger than the system can prove, the product becomes misleading. Nekonymous is useful as a reminder to name guarantees carefully: anonymous to the recipient is not the same promise as anonymous to every system involved.

## Current Status

Prototype. The project is valuable as a privacy, bot UX, and edge-state experiment, but it should not be described as a finished secure messaging platform.

## Next Steps

- [ ] Document the Durable Object boundaries at a public, non-sensitive level.
- [ ] Write a short abuse-control checklist for anonymous messaging products.
- [ ] Add a deployment note for Telegram webhooks on Cloudflare Workers.
- [ ] Decide which encryption details should become a separate lab note.
