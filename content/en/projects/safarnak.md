---
title: Safarnak
description: A project note on Safarnak - a forkable AI trip workspace built around editable plans, offline usefulness, and shared TypeScript contracts.
date: 2025-10-23
updated: 2026-05-14
status: Active
tags:
- travel-planning
- ai-workspace
- offline-first
- forkable-content
- react-native
- expo
repo: https://github.com/mohetios/safarnak.app
website: https://safarnak.app
featured: true
---

Safarnak is a forkable AI trip workspace.

The core loop is simple: create a trip, edit it, share it, fork it, and personalize it. The product is not trying to become a full social network for travel. It is trying to make travel planning feel more like a reusable workspace than a disposable chat or static itinerary.

Repository:

- [mohetios/safarnak.app](https://github.com/mohetios/safarnak.app)
- [safarnak.app](https://safarnak.app)

## Why It Exists

Trips are planned in fragments.

A note in one app.  
A map pin somewhere else.  
A message from a friend.  
A half-useful AI answer.  
A budget constraint that changes everything.

Safarnak exists because those fragments should be editable, inspectable, and reusable. A good trip plan should survive unstable networks, many small sessions, and the moment when someone says, "Can I use your plan and change it for myself?"

## What It Explores

The product explores travel planning as a workspace:

- AI output as draft material, not hidden truth,
- itineraries that can be forked and personalized,
- local-first behavior for unstable travel contexts,
- bilingual English and Persian support as a product constraint,
- shared contracts between mobile app and edge backend.

The useful question is not "Can AI generate a trip?" That part is easy to demo. The harder question is whether the generated material can become a plan people understand, edit, carry, and reuse.

## How It Works

The current architecture uses Expo React Native for the app, Cloudflare Workers for the backend, GraphQL Yoga for the API surface, D1 and Drizzle for structured data, and shared TypeScript contracts to keep client and server aligned.

Cloudflare storage primitives such as KV, R2, Vectorize, and Durable Objects are used only where they fit the workflow. The product should stay small enough that the planning loop remains visible.

The important design choice is that data is not treated as remote-only. Local cached state should be queryable and understandable, not a loose shadow of the API.

## What I Learned

AI planning products need editing more than magic.

If the output cannot be inspected, changed, reused, or corrected, it becomes another disposable answer. Safarnak is useful because it keeps the plan as the product artifact and treats AI as one way to shape it.

## Current Status

Active. The product and technical foundation are still being refined, especially around public workflow, offline behavior, and how much of the system should be shown before the first stable product flow is ready.

## Next Steps

- [ ] Document the app/server package boundaries.
- [ ] Add a short note on the GraphQL schema and shared TypeScript types.
- [ ] Capture the offline cache and sync model in a lab note.
- [ ] Add public screenshots when the first stable product flow is ready.
