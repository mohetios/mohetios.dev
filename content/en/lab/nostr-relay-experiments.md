---
title: Nostr Relay Experiments
description: Notes on private TypeScript relay work, a Cloudflare relay experiment, and reading an Erlang Nostr implementation as a protocol reference.
date: 2024-03-18
updated: 2024-10-18
status: Private review
tags:
  - nostr
  - cloudflare-workers
  - decentralized-protocols
  - typescript
---

The Nostr repositories are less a finished product and more a protocol study.

Related repositories:

- private `mehotkhan/nostr-relay`
- private `mehotkhan/cloudflare-nostr-relay`
- [mehotkhan/nostr](https://github.com/mehotkhan/nostr), a fork of an Erlang implementation

## Why Relays Are Interesting

A relay is a small idea with large consequences. It receives events, validates enough structure to route them, stores or forwards what it accepts, and becomes part of a wider social protocol.

That makes it a good architecture exercise:

- How much state should a relay keep?
- Which validation belongs at the edge?
- What abuse controls are necessary before public traffic arrives?
- Can a serverless or edge runtime fit the relay model?
- What does interoperability require beyond passing a happy-path test?

## Cloudflare Angle

The Cloudflare relay experiment is interesting because relay workloads do not look exactly like ordinary request-response APIs. Connections, fanout, storage, and rate limits all matter.

The open question is whether an edge-first relay can stay simple while still behaving responsibly under public network conditions.

## Task Checklist

- [ ] Review private relay code before publishing any implementation details.
- [ ] Extract protocol-level notes that do not expose private infrastructure.
- [ ] Compare TypeScript and Erlang implementation choices.
- [ ] Decide whether this should become a public lab series or remain an internal architecture note.
