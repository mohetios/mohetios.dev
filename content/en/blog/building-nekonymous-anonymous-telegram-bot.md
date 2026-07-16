---
title: 'Nekonymous: The Cat That Was Supposed To Only Deliver The Message'
description: The rebuild story behind Nekonymous, from anonymous bot data risks to sealed tickets, blind storage, conversation suggestions, and honest privacy boundaries.
thumbnail: /content/nekonymous-blog.webp
date: 2026-07-15
updated: 2026-07-16
tags:
  - anonymous-messaging
  - telegram-bot
  - cloudflare-workers
  - durable-objects
  - sealed-capabilities
  - privacy-boundaries
  - threat-model
  - conversation-suggestions
---

The first idea for Nekonymous appeared in my head a few years ago, but what made it feel serious was the story of several well-known anonymous message bots being hacked.

After access to those servers surfaced, it became clear that what users saw as a simple relay for anonymous messages had been keeping a large amount of messages, photos, videos, and user information behind the scenes.

The stories published at the time were not all consistent. Which data was deleted, which bots stopped working, and what exactly happened afterward were not always clear.

But the part that mattered to me was simple:

An anonymous message bot was supposed to take a message from one person and deliver it to another person.

So why should it become a large, coherent archive of people's private lives?

My idea was to build an anonymous Telegram bot that did only the thing it was supposed to do.

Not more.

Receive the message, deliver it, and keep as little extra data as possible.

If someone no longer wanted to use the bot, they should be able to delete the account, invalidate the old link, and remove the data connected to that account from the system.

Deleting an account was not the hard part.

The harder question was:

**How can we keep data in the smallest and most limited form possible, while the bot can still support anonymous messages, anonymous replies, blocking, reporting, and the continuation of a conversation?**

## The Problem Was Not Only Message Encryption

The first obvious answer is to encrypt message bodies and put them in the database.

But if the system still stores this next to them:

```txt
this message was sent by user A
to user B
inside conversation C
at time D
```

then a large part of the privacy problem remains.

Even if the text is unreadable, the database structure can still show who contacted whom, how many times, and for how long.

So the problem was not only hiding the message body.

The relationship itself also had to be pushed out of a direct, searchable shape as much as possible.

With that assumption, I designed the first core of Nekonymous ticketing.

Instead of treating each message as a normal row connected to a sender and a recipient, each message became an **independent ticket**.

Something like a sealed envelope that contains only the material needed to deliver that message and perform actions related to that message.

The first model combined:

```txt
Key-Value Storage
+ Blind Hashes
+ Encrypted Payload
+ Short-lived Capabilities
```

Every message is encrypted for a limited time and receives an independent capability.

One part of that capability is used to locate a blind record inside the vault. The other part is used to derive the encryption keys needed for the ticket.

The raw capability is not stored in TicketVault.

The database sees only a hashed lookup, encrypted route material, encrypted payload, and limited metadata.

Even that capability is not enough by itself. The system also checks that the action is being performed by the recipient's current account.

When the recipient opens the inbox, the bot resolves the ticket, verifies ownership, opens the payload for that delivery, and sends the message to Telegram.

After successful delivery, the payload is cleared from Neko storage and the unread item is removed from the inbox.

What remains is the minimal encrypted route needed for the buttons attached to that delivered Telegram message:

- reply;
- private nickname;
- block;
- report.

So Neko's inbox is not a message archive.

It is a bounded delivery queue for messages that have not been seen yet.

After delivery, the text lives in the user's Telegram chat. Neko does not need to keep an extra copy for itself.

## A Deliberately Blind Database

In this model, Neko avoids keeping a direct table of user relationships as much as possible.

D1 stores structural data such as active accounts, public links, and aggregate statistics. It does not store anonymous message bodies or a direct sender-recipient graph.

KV is only cache and routing. It is not the source of truth.

TicketVault stores encrypted tickets without a direct `sender_id` or `recipient_id` inside each record.

Reports are built with blind tags, so the system can detect abuse patterns without creating a readable network of users.

This design does not claim that the database has nothing to expose.

Timestamps, record counts, status values, ciphertext sizes, and access patterns are still metadata.

If the runtime or the main application keys are compromised, encryption at rest no longer provides full protection.

But there is a real difference between a database that begins as a ready-made table of "who said what to whom" and a system that intentionally splits data across separate boundaries, blind lookups, and encrypted capsules.

Neko's goal was not magical anonymity.

The goal was for the system itself to know no more than it needs to know in order to do its job.

## Rebuilding Neko

During the July 2026 rebuild, I took Neko out of the raw first idea and rebuilt it across architecture, code, security, failure handling, and user experience.

The point was not to place a pile of new Cloudflare services next to each other.

Each tool needed a precise responsibility in the core of Neko.

The current architecture has one Worker, but state and responsibility are split across separate planes:

```txt
Cloudflare Worker + grammY
D1
Durable Objects
KV
Queues
Vectorize
Web Crypto
```

D1 keeps only structural data and aggregate statistics.

UserState manages each user's local state, temporary inbox, drafts, blocks, private labels, and rate limits.

TicketVault owns sealed anonymous tickets.

SafetyState keeps blind reports and abuse sanctions.

ProfileVault stores finalized conversation profiles in encrypted form.

ConversationVault and PairLedger manage suggestions, requests, cooldowns, and pair limits without building a public relationship table.

TelegramOutbox sends messages in a paced and idempotent way, so Queue retries do not create duplicate logical sends.

Queues move background work such as delivery, statistics, and profile indexing out of the main user path.

KV is only for cache and fast route lookup.

Vectorize retrieves a bounded set of initial candidates and does not make final decisions about people.

This is not classic microservice architecture.

It is a Worker-native system where every storage plane knows exactly what it should keep and, more importantly, what it should not keep.

## Conversation Suggestions

During the rebuild, I added another important part to Neko:

**Conversation Suggestions.**

The idea was not to turn Neko into a dating app, matchmaking product, or personality test.

The idea was smaller:

People do not necessarily have good conversations only because they are "similar."

One person might be more direct. Another might need more time. One person may want quick replies. Another may think with longer gaps. One may want deeper conversation and another may prefer something lighter.

So I designed a 25-question assessment with 8 dimensions that creates two separate pictures:

```txt
How do I usually talk?
What kind of conversation do I currently want from the other side?
```

Entry into suggestions is fully optional, and discoverability is off by default.

The July 15, 2026 UX cleanup made the assessment and suggestions feel like one flow instead of separate tools. The Suggestions hub now keeps assessment progress, discoverability, index readiness, and the user's controlled profile summary in one place.

The first 16 questions use a simple self-style scale. The next 8 explain the two ends of each dimension — very light to very deep, very slow to very fast, indirect to direct — instead of reusing one vague scale for every preference. Progress can be saved and resumed, and starting over turns discoverability off.

The search action appears only after both profile vectors exist and the index has been verified. A profile can be stored before that work finishes, so the UI says it is still being prepared instead of pretending it is ready.

Vectorize retrieves only a limited initial set of options.

Final ranking is deterministic TypeScript. There is no model deciding in the background who is "right" for whom.

The system only shows a few closer current conversation options.

And even then, no conversation starts automatically.

One person writes an intro, the other person accepts or declines it, and only after acceptance does that request become a normal anonymous sealed ticket.

So this new feature still returns to the same core primitive:

**one independent ticket, one limited route, and an anonymous conversation start without creating a direct relationship table.**

## The Orange Cat Of Anonymous Messages

Another part I cared about was the language of the bot itself.

The name Nekonymous comes from two words:

```txt
Neko
+
Anonymous
```

`Neko` means cat in Japanese. `Anonymous` means anonymous.

So Nekonymous can mean something close to "anonymous cat."

Or more specifically:

**the orange cat of anonymous messages.**

I did not want that name to stay only in the logo.

I tried to make the bot's behavior, wording, errors, and even confused moments carry the same character.

When you start the bot for the first time, instead of a long formal text, the current Persian opening says roughly:

> Meow, you're here 🐾
>
> I'm Nekonymous — the orange cat of anonymous messages.
>
> Here is your anonymous-message link:
>
> `https://t.me/nekonymous_bot?start=...`
>
> Anyone who opens it can send you an anonymous message.

In the same cleanup, I shortened the send, inbox, settings, and error states. Each one should say what happened and what the user can do next. The cat voice stays, but it should not get in the way of a privacy boundary or a failure message.

Sometimes, if you send the wrong command, get lost in the middle of a flow, or there is nothing to show, the bot may answer in cat language too.

For me this was not only a joke or UI decoration.

A product that touches personal and sometimes sensitive messages should not feel like a cold security console.

Neko needs to take its limits seriously, but it can still stay simple, friendly, and a little playful.

## What Neko Does Not Guarantee

This part may matter more than the architecture itself.

Nekonymous is not an end-to-end encrypted messenger.

Telegram sees the message while it is sent and received.

The Neko Worker also sees plaintext while processing, encrypting, decrypting, and delivering it.

If someone controls the runtime or the main application secrets, they can access data being processed during that window.

The recipient can also copy, screenshot, forward, or publish the message somewhere else.

Neko does not claim that a user stays anonymous from every angle, or that it provides absolute security and zero trust.

What it tries to do is narrower, but more real:

- hide users from each other in the normal product flow;
- avoid storing message text in D1 and KV;
- keep remaining data as hard to join as practical;
- clear payload after delivery;
- bound retention;
- enforce block, report, pause, and hard reset server-side;
- be honest about the parts that still require trust in Telegram, Cloudflare, and the operator.

## This Was Version One

The first version of Neko started from a simple question:

> Can an anonymous message bot deliver messages without becoming the owner of an archive of people's private lives?

The answer I have now is not complete or magical.

But it is a real, tested, reviewable system:

- personal anonymous links;
- text and supported media;
- bounded inbox;
- anonymous replies;
- private nicknames;
- block and report;
- pause for incoming messages;
- full account reset with a new identity;
- conversation style assessment;
- a unified profile and Suggestions hub with saved progress and readiness states;
- optional conversation suggestions;
- independent sealed-ticket architecture.

The whole project is open source.

The code, architecture, Threat Model, limits, and technical decisions are available on GitHub for review.

I cleaned, reviewed, and hardened the code and documentation as much as I could, so the bot can run with limited resources and clear boundaries.

The final goal is still the first sentence:

> deliver anonymous messages without unnecessarily peeking into people's private lives and conversations.

Neko does not claim that everything is solved.

But it tries to do its job precisely and avoid keeping what it should not keep.

If you see a problem in the code, documentation, user experience, or the logic itself, tell me.

Meow.
