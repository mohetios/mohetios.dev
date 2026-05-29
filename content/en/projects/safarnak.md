---
title: Safarnak
description: An offline-first travel companion built with Expo React Native, Cloudflare Workers, GraphQL, Drizzle, and shared TypeScript types.
date: 2025-10-23
updated: 2026-05-14
status: Active
tags:
  - ai
  - travel
  - offline-first
  - react-native
  - cloudflare
  - product
repo: https://github.com/mehotkhan/safarnak.app
website: https://safarnak.app
featured: true
---

Safarnak is a full-stack travel companion shaped around a practical constraint: trips are planned on unstable networks, across devices, and over many small sessions. The product needs to keep context available locally while still syncing to an edge backend when the network is available.

The current architecture uses Expo React Native for the app, Cloudflare Workers for the backend, GraphQL Yoga for the API surface, D1 and Drizzle for structured data, and Cloudflare storage primitives such as KV, R2, Vectorize, and Durable Objects where they fit the workflow.

The important design choice is that the data model is not treated as a remote-only concern. Safarnak keeps a shared schema between server and client code so local cached data can be queried and reasoned about instead of becoming a loose shadow of the API.

Repository:

- [mehotkhan/safarnak.app](https://github.com/mehotkhan/safarnak.app)
- [safarnak.app](https://safarnak.app)

That makes the project useful as both a product experiment and a technical reference:

- How much of a travel app can stay useful while offline?
- Where should AI assistance enter the workflow without hiding the plan from the user?
- Can the same TypeScript and GraphQL contracts keep a mobile client and edge backend aligned?
- What belongs in durable sync, and what should remain a temporary planning artifact?

Current notes for the project:

- Keep the workspace inspectable and editable.
- Treat AI output as draft material, not hidden truth.
- Make planning artifacts easy to reuse.
- Build for mobile first without making the core workflow heavy.
- Keep bilingual English and Persian support as a first-order product constraint.

## Next Tasks

- [ ] Document the app/server package boundaries.
- [ ] Add a short note on the GraphQL schema and shared TypeScript types.
- [ ] Capture the offline cache and sync model in a lab note.
- [ ] Add public screenshots when the first stable product flow is ready.

This page will collect public design notes, implementation decisions, and release milestones as the project develops.
