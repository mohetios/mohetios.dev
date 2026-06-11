---
title: Offline-First and P2P Product Architecture
description: Notes connecting Safarnak, PNews, Bagche, and older P2P commerce experiments around local-first state, sync, and product trust.
date: 2021-09-07
updated: 2026-05-14
status: Exploring
tags:
  - offline-first
  - p2p
  - local-first
  - product-architecture
  - sync
---

Offline-first and peer-to-peer systems begin with the same uncomfortable question: what should still work when the center is unavailable?

The projects around this question include:

- [mehotkhan/safarnak.app](https://github.com/mehotkhan/safarnak.app)
- [mehotkhan/pnews](https://github.com/mehotkhan/pnews)
- [bagche/mamoochi](https://github.com/bagche/mamoochi)
- older private P2P commerce and Bagche experiments

## Product Constraint

Offline-first is not a cache strategy. It is a product promise.

For a travel app, the user may need plans while moving through a weak network. For a feed reader, the user may want saved content without waiting for the network. For commerce or P2P experiments, trust, sync, and ownership become part of the product surface.

The architecture has to answer these questions before the UI can feel stable:

- Which data is authoritative locally?
- Which data must sync to a server or peer?
- What happens when two edits conflict?
- Which operations can be queued?
- What should the user see when the network returns?

## Architecture Notes

Safarnak pushes this pattern toward a modern edge-backed product: shared TypeScript types, GraphQL, local data, and Cloudflare services for durable backend state.

PNews and the older P2P work explore a different direction: distributed reading and commerce flows where the network itself is part of the experiment.

The lesson across both paths is that sync should be designed as a user experience, not only a protocol. People need to know whether their plan, purchase, note, or saved item is actually available.

## Task Checklist

- [ ] Map Safarnak's local data model against its remote GraphQL model.
- [ ] Recover the public parts of PNews and document its GUNDB/P2P assumptions.
- [ ] Decide which Bagche and P2P commerce details are safe to publish.
- [ ] Write a follow-up note on conflict states and user-facing sync language.
