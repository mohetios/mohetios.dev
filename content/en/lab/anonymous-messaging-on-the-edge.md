---
title: Anonymous Messaging on the Edge
description: Notes from Nekonymous on routing private Telegram conversations with Workers, Durable Objects, encryption, and abuse controls.
date: 2024-08-19
updated: 2025-04-29
status: Exploring
tags:
  - cloudflare-workers
  - privacy
  - telegram
  - durable-objects
  - encryption
---

Anonymous messaging is easy to describe and difficult to make responsible.

Nekonymous starts with a familiar product shape: one user receives a link, another user opens it, and a message moves through a bot without revealing the sender's identity. The engineering problem begins after that first message.

Project repository:

- [mehotkhan/Nekonymous](https://github.com/mehotkhan/Nekonymous)

## Routing Without Exposure

The system still needs identifiers. It needs to know which inbox should receive a message, which reply belongs to which conversation, and which sender has been blocked. The privacy goal is not to remove all state; it is to keep the state scoped, encrypted where appropriate, and separated from unnecessary identity.

Durable Objects fit this model because they provide a natural place to coordinate conversation or inbox state without turning every request into a global database problem.

## Abuse Controls Are Core Product Logic

Anonymous systems need controls from the beginning:

- Rate limiting protects the recipient and the bot.
- Blocking gives the recipient agency.
- Self-message prevention keeps the workflow honest.
- Webhook authentication limits who can send events into the system.
- Encryption protects message contents when storage is involved.

These features are not add-ons. Without them, anonymity becomes a liability instead of a product property.

## Open Questions

The interesting design work is around boundaries:

- How long should conversation state live?
- What metadata is necessary for replies?
- How much should a recipient know about repeated anonymous senders?
- What should be deleted immediately, and what needs to exist for safety?

This is the kind of project where the architecture and the ethics of the interaction have to be designed together.

## Task Checklist

- [ ] Draw the anonymous message and reply flow.
- [ ] Separate privacy guarantees from product promises.
- [ ] Document rate limits, block lists, and self-message prevention.
- [ ] Review which metadata should expire and which metadata is needed for safety.
