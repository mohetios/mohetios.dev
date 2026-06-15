---
title: Nekonymous
description: Nekonymous is a Persian-first anonymous Telegram messaging bot built with Cloudflare Workers, KV, and SQLite-backed Durable Objects, with an honest hosted-relay privacy model.
date: 2024-08-19
updated: 2026-06-15
status: MVP
tags:
  - telegram
  - cloudflare-workers
  - privacy
  - anonymous-messaging
  - durable-objects
  - serverless
repo: https://github.com/mehotkhan/Nekonymous
website: https://nekonymous.alizemani.ir/
---

Nekonymous is a Persian-first anonymous messaging bot for Telegram.

The product is small by design. A user starts the bot, receives a personal Telegram deep link, and shares that link wherever they want. Someone else can open the link and send a message without seeing the owner's Telegram username. The owner reads messages from `/inbox`, replies through the bot, blocks senders when needed, pauses new incoming messages, and keeps private nicknames for repeat senders.

That is the visible product.

The more interesting part is the boundary around it. Anonymous messaging is useful because it creates room for messages people may not send in a normal visible chat. It is also risky because the same distance can make abuse easier. I built Nekonymous as a small social and privacy tool that names those boundaries instead of hiding them behind vague promises.

Repository:

- [mehotkhan/Nekonymous](https://github.com/mehotkhan/Nekonymous)
- [nekonymous.alizemani.ir](https://nekonymous.alizemani.ir/)

Related notes:

- [Lab note: anonymous messaging on the edge](/lab/anonymous-messaging-on-the-edge)
- [Persian article draft: why I built Nekonymous](/fa/blog/why-i-built-nekonymous)

## Why I Built It

Anonymous message tools usually look simple from the outside.

One person gets a link.

Another person sends a message.

No name is shown.

But the real product starts after that. Can the recipient reply without exposing themselves? Can they block a sender? Can they pause the link when it becomes noisy? Should repeat senders have private nicknames? How much state is needed for routing, and how much identity should stay out of the visible interface?

Nekonymous was a compact way to explore those questions in a familiar Iranian surface: Telegram. It is not a new social network, a helpdesk, or a full privacy platform. It is a hosted anonymous relay with a clear job: reduce user-visible identity leakage while keeping the relay fast, understandable, and operationally small.

## Core Features

- Personal Telegram deep link for each user.
- Anonymous incoming messages through the bot.
- `/inbox` delivery for pending messages.
- Anonymous replies in both directions.
- Block and unblock controls for recipients.
- Pause mode for new incoming link-based messages.
- Private nicknames for repeat senders.
- Encrypted-at-rest message payload storage.

## Architecture

The implementation intentionally stays small:

```txt
Telegram
  -> Cloudflare Worker
  -> Grammy bot handlers
  -> Cloudflare KV
  -> recipient Durable Object inbox + SQLite
```

There is one Cloudflare Worker. Telegram webhooks enter through that Worker, Grammy handles commands and callbacks, KV stores user profiles, UUID maps, approximate stats, and encrypted conversation blobs, and one SQLite-backed Durable Object inbox is used per recipient.

There is no SPA, no D1, no Queues, and no second Worker. Those choices are not missing ambition. They are part of the design. The system is easier to explain and review when the hot path is small, the state boundaries are direct, and the inbox queue has one obvious owner.

## Privacy Model

Nekonymous is a hosted anonymous relay. It is not end-to-end encrypted.

The bot UI protects users from seeing each other's Telegram username through the normal message flow. Message bodies are encrypted before they are stored in KV or Durable Object storage. A storage-only attacker with KV/DO data but without `APP_SECURE_KEY` cannot decrypt message bodies. After `/inbox` delivery, the plaintext payload is cleared from KV, while encrypted connection metadata remains so reply, block, and nickname callbacks can keep working.

The limits are just as important.

Telegram still receives the original messages because this is a Telegram bot. The Worker sees plaintext while processing a message. A Cloudflare or operator account that can change Worker code or access runtime secrets can compromise future messages. An operator with `APP_SECURE_KEY` plus stored ticket IDs and ciphertext can decrypt stored conversations. Some metadata is intentionally stored in plaintext: user records, link UUID maps, block lists, paused state, private nickname maps, and active draft state.

The honest security goal is simple:

> Minimize stored plaintext and user-visible identity leakage while keeping the relay fast and operationally simple.

## Key Decisions

I kept the architecture Worker-first because Telegram webhooks should be cheap to receive and easy to reason about.

I used KV for simple records and encrypted blobs because profiles, link maps, and approximate stats do not need strict queue ordering.

I used one Durable Object inbox per recipient because inbox ordering and bounded delivery need a stronger coordination point than eventually consistent KV.

I encrypted message payloads at rest with Web Crypto, HKDF-SHA-256, and AES-256-GCM. Each accepted message gets a fresh random ticket ID. HKDF labels separate the AES key, conversation ID, and sender alias. The public project page does not need every byte-level detail, but the separation matters.

I capped the inbox at 50 rows because anonymous systems need operational limits. Old delivered references are pruned before rejecting new messages. If all 50 rows are pending, the sender gets the inbox-full message and the just-written KV ciphertext is removed.

I kept the copy Persian-first because the product is built for Persian Telegram use, not as a generic international SaaS surface.

## Current Status

Nekonymous is a clean MVP. The main relay flow works: links, anonymous sends, inbox delivery, replies, blocks, pause mode, private nicknames, encrypted-at-rest payloads, and account reset.

It should not be presented as a finished secure messaging platform. The useful version of the project is more specific: a small, privacy-aware Telegram relay with explicit boundaries and a compact edge architecture.

## What This Demonstrates

Nekonymous shows product-shaped engineering more than feature volume.

It demonstrates how to design a user-facing privacy promise carefully, how to keep an edge system small, how to split eventually consistent records from ordered inbox state, how to use Web Crypto in a Worker runtime, and how to discuss security limits without weakening the value of the product.

That is the part I care about: not making the bot look bigger than it is, but making the decisions behind it clear enough to inspect.
