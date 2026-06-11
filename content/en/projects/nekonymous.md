---
title: Nekonymous
description: A privacy-focused anonymous Telegram messaging bot built on Cloudflare Workers and Durable Objects.
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

Nekonymous is an anonymous messaging bot for Telegram. A user starts the bot, receives a unique link, and shares that link with others. People who open it can send messages without exposing their identity to the recipient.

The project is less about the novelty of anonymous messages and more about the edge cases that make that workflow usable: routing replies, preventing self-messaging, blocking senders, rate limiting abuse, and keeping conversations private.

The implementation uses Cloudflare Workers as the deployment runtime and Durable Objects for per-user or per-conversation coordination. Messages are encrypted with AES-GCM, and request handling is guarded so the worker only accepts expected Telegram webhook traffic.

Repository:

- [mehotkhan/Nekonymous](https://github.com/mehotkhan/Nekonymous)
- [nekonymous.alizemani.ir](https://nekonymous.alizemani.ir/)

Important product and system questions:

- How much state does an anonymous messaging flow need to preserve?
- Where does anonymity end if replies are allowed?
- Which controls should the recipient have when messages become abusive?
- What should be encrypted, and which identifiers still need to exist for routing?
- How can an edge runtime keep latency low without making privacy logic vague?

Nekonymous is a compact project, but it touches security, abuse prevention, bot UX, and distributed state in a way that makes it a useful lab subject.

## Next Tasks

- [ ] Document the Durable Object boundaries for inbox and conversation state.
- [ ] Write a public abuse-control checklist for anonymous messaging products.
- [ ] Add a deployment note for Telegram webhooks on Cloudflare Workers.
- [ ] Decide which encryption details should become a separate lab note.
