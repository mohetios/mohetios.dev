---
title: Anonymous Messaging on the Edge  
description: Notes from Nekonymous on building a responsible anonymous Telegram relay with Cloudflare Workers, Durable Objects, encrypted storage, and abuse controls.  
date: 2024-08-19  
updated: 2026-06-12  
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


Anonymous messaging is easy to explain and difficult to design responsibly.

The product shape is familiar: one person receives a private link, another person opens it, sends a message, and the message reaches the recipient without exposing the sender’s Telegram username.

That sounds simple.

The real system begins after that first message.

How do replies work?  
How do blocks work?  
How do you prevent self-messages?  
How do you keep enough state to route a conversation without turning anonymity into a tracking machine?  
How do you explain the privacy boundary honestly?

Nekonymous is my attempt to explore those questions as a small, practical, edge-native product.

Project repository:

- [mehotkhan/Nekonymous](https://github.com/mehotkhan/Nekonymous)
    

## The Product Shape

Nekonymous is a Persian-first anonymous messaging bot for Telegram.

A user starts the bot and receives a personal link. Anyone who opens that link can send a message to the owner of the link. The recipient reads the message from their bot inbox and can reply, block, unblock, or assign a private nickname to that sender.

The important detail is that anonymity is not only one-way.

The first sender does not expose their Telegram username to the recipient. The recipient can reply without turning the conversation into a normal visible Telegram chat. Both sides interact through the bot, and the system routes the conversation using internal references rather than visible identities.

That is the product promise.

But the engineering promise needs to be more careful.

This is not magic.  
This is not “no state.”  
This is not a claim that the system knows nothing.

Anonymous messaging still needs identifiers. It needs a recipient link. It needs a way to connect a reply to the original sender. It needs a way to know whether the recipient blocked that sender. It needs callback references for inline actions. It needs enough metadata to keep the interaction useful and safe.

The privacy goal is not to remove all state.

The goal is to keep state scoped, encrypted where appropriate, short-lived where possible, and separated from unnecessary identity.

## The Honest Privacy Boundary

Nekonymous is a hosted anonymous relay.

That sentence matters.

The recipient does not see the sender’s Telegram username. The sender does not need to reveal themselves to start a conversation. Message bodies are encrypted at rest inside the application storage. Inline actions use opaque references instead of visible sender IDs.

But this is not full end-to-end encryption.

The operator controls the infrastructure, the bot token, and the application secret. With that access, the operator can map internal records and decrypt stored payloads. Telegram itself is also part of the transport boundary because this is a Telegram bot, not a custom encrypted messaging client.

That is why the right promise is not:

> No one can ever know anything.

The right promise is closer to:

> The recipient does not receive the sender’s Telegram identity, message bodies are protected inside the application storage, and the system is designed to minimize unnecessary exposure while keeping enough state for replies, blocking, and safety.

For an anonymous product, that distinction is not a detail. It is the product.

Overpromising privacy creates danger. Under-designing abuse controls creates danger too. Responsible anonymity sits between these two mistakes.

## Architecture as Product Design

Nekonymous runs as a Cloudflare Worker.

The Worker receives Telegram webhook updates, creates or loads the bot runtime, handles commands and callbacks, talks to KV for profile and encrypted conversation records, and talks to a Durable Object inbox for recipient-specific ordering.

The core shape is compact:

- one edge Worker for the HTTP surface and Telegram webhook
    
- Grammy for the Telegram bot runtime
    
- Cloudflare KV for user records, link maps, encrypted conversation blobs, and stats
    
- one SQLite Durable Object inbox per recipient
    
- Web Crypto with HKDF-SHA-256 and AES-256-GCM for message tickets and ciphertext
    
- Telegram inline callbacks for reply, block, unblock, and nickname actions
    

This split is deliberate.

KV is useful for global reads, profile records, UUID-to-user maps, encrypted conversation blobs, and small counters. But KV is eventually consistent, so it is not the right place to depend on strict inbox ordering.

The Durable Object is the coordination point.

Each recipient gets a Durable Object instance keyed by their Telegram ID. That object owns the pending inbox queue. It serializes enqueue and delivery operations. It stores a small SQLite table of inbox entries with the reference, ticket ID, conversation ID, ciphertext while pending, delivery state, and creation time.

This is the part I like most in the architecture: the storage model follows the product boundary.

User state lives in KV.  
Inbox ordering lives in the recipient’s Durable Object.  
Message content is encrypted.  
Callback handles are short opaque references.  
The recipient’s inbox is not treated as a global database problem.

That makes the system easier to reason about.

## Message Lifecycle

A message starts when a visitor opens someone’s link.

The bot validates the link token, resolves the owner, checks whether the visitor is not messaging themselves, checks whether they are blocked, checks whether the recipient has paused new messages, and then opens a draft conversation.

When the visitor sends text or media, the app builds a conversation payload and encrypts it. The encrypted blob is written to KV under a derived conversation key. A copy of the ciphertext is also inserted into the recipient’s Durable Object inbox so it can be delivered later in order.

If the recipient’s inbox is full, the system rejects the message and deletes the KV blob to avoid orphaned encrypted records.

When the recipient runs `/inbox`, the Durable Object returns pending entries. The Worker decrypts each pending message, sends it to the recipient through Telegram, then changes the storage state:

- the KV record is re-encrypted with the message payload cleared
    
- the Durable Object row is marked as delivered
    
- the ciphertext copy in the Durable Object is cleared
    
- the callback reference remains so reply/block/nickname actions can still resolve the conversation
    

That lifecycle is important.

A delivered message should not need to keep its body inside multiple stores forever. But the system still needs enough connection metadata to let the recipient reply, block, or label the sender later.

So the design separates payload from routing metadata.

That is the kind of small privacy decision that matters in anonymous systems.

## Controls Are Core Product Logic

Anonymous messaging without abuse controls is not a privacy product. It is a liability.

Nekonymous treats controls as part of the core product, not as admin features to add later.

The current control model includes:

- self-message prevention
    
- recipient block lists
    
- unblock flow
    
- pause/resume inbox setting
    
- per-user send/link rate limits
    
- inbox queue cap
    
- webhook secret verification
    
- callback authorization
    
- account deletion
    
- destructive operator cleanup
    
- no logging of secrets, ticket IDs, decrypted payloads, or tokens
    
- private nicknames that live only on the recipient profile
    

Some of these controls are technical. Some are social. Some are both.

Blocking is not just a database update. It gives the recipient agency.

Pause mode is not just a setting. It lets the recipient stop new link-based messages without breaking existing reply threads.

Callback authorization is not just security hygiene. It prevents someone from acting on a reply/block reference that does not belong to them.

The lesson is simple: in an anonymous product, abuse controls are not moderation polish. They are part of the privacy model.

## The Metadata Problem

The hardest design question is not whether the system should store data. It must store some data.

The harder question is: what data deserves to exist?

There are different classes of state:

- public link token
    
- Telegram user ID
    
- recipient profile
    
- block list
    
- current draft
    
- encrypted conversation blob
    
- pending inbox entry
    
- callback reference
    
- reply connection metadata
    
- nickname alias
    
- rate-limit timestamp
    
- aggregate stats
    

Each one needs a reason.

Some state exists to route messages.  
Some exists to protect the recipient.  
Some exists to prevent abuse.  
Some exists only for the product experience.  
Some should expire.  
Some should be cleared after delivery.  
Some should never be logged.

This project became interesting when I stopped thinking about storage as implementation detail and started thinking about it as a set of product promises.

Every stored field says something about the system.

## Why The Edge Fits

Nekonymous is small, but it has a shape that fits edge infrastructure well.

Telegram webhook requests need a fast acknowledgement. The app should not block the hot path on unnecessary work. The Worker can respond to Telegram quickly, while non-critical work like stats updates can be deferred.

Recipient inbox ordering needs a stateful coordination point, but not a full server or central database for every operation. Durable Objects provide a natural model: one actor-like object per recipient inbox.

Message content needs storage, but not every read needs strong ordering. KV works for user records, encrypted blobs, and read-heavy lookup paths, while the Durable Object handles the serialized queue.

This is a good example of how edge architecture should not mean “put everything everywhere.”

It means choosing where each kind of state belongs.

## What I Learned

The main lesson from Nekonymous is that privacy is not a single feature.

It is a chain of small decisions:

- what the recipient can see
    
- what the sender can assume
    
- what the operator can technically access
    
- what is encrypted
    
- what is only pseudonymous
    
- what is cleared after delivery
    
- what is needed for safety
    
- what is never logged
    
- what is explained to users without exaggeration
    

Anonymous messaging makes those decisions visible.

It forces the architecture and the ethics of the interaction to be designed together.

That is why this project belongs in the lab. It is not only a Telegram bot. It is a small study in product boundaries, storage design, abuse control, and honest privacy language.

## Open Questions

There are still important questions to keep refining:

- How long should reply metadata live?
    
- Should delivered callback references expire after a fixed window?
    
- Should encrypted KV conversation records use explicit TTLs?
    
- How should abuse reports work without exposing more identity than necessary?
    
- What should the recipient know about repeated anonymous senders?
    
- Should nicknames remain purely local, or should they support export/delete tools?
    
- What should be deleted immediately when an account is removed?
    
- How should the public privacy page explain hosted relay limitations clearly?
    
- How should media messages be handled differently from text?
    
- Where is the right line between safety metadata and unnecessary retention?
    

These questions are not secondary.

For this kind of product, they are the real design work.

## Next Checklist

-  Rewrite the public privacy page with a clear “hosted relay, not full E2E” explanation.
    
-  Add a diagram for send, inbox delivery, reply, block, and nickname flows.
    
-  Document which fields are identity, pseudonym, routing metadata, ciphertext, or safety state.
    
-  Add lifecycle notes for every stored key and Durable Object row.
    
-  Decide TTL rules for delivered conversations and callback references.
    
-  Add a safer abuse-report flow without exposing unnecessary sender identity.
    
-  Add tests around self-message prevention, block/unblock, pause mode, inbox cap, and callback authorization.
    
-  Review media payload handling and retention separately from text messages.
    
-  Improve README language so privacy guarantees and product promises are separated.
    
-  Publish a short technical case study on using Durable Objects as recipient-scoped inbox actors.
    

Nekonymous started as a small anonymous messaging bot.

The deeper version is more interesting:

a responsible anonymous relay, built on the edge, where privacy, routing, storage, and abuse controls have to be designed as one system.