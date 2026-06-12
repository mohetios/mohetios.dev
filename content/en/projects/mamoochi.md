---
title: Mamoochi
description: A project note on Mamoochi - an open-source Jamstack framework for Nuxt, Vue, and Cloudflare-friendly content systems.
date: 2024-10-31
updated: 2025-05-19
status: Active archive
tags:
  - jamstack
  - nuxt
  - vue
  - cloudflare
  - open-source
repo: https://github.com/bagche/mamoochi
website: https://mamoochi.bagche.app/
featured: true
---

Mamoochi is an open-source Jamstack framework from the Bagche workspace. It sits between a starter template and a product platform: more opinionated than a blank Nuxt project, but still small enough to inspect.

The project belongs to the same family as Totoro and Mohetios.dev. All three care about content, public pages, Git-friendly structure, and deployment paths that do not require a heavy server. Mamoochi pushes that pattern toward reuse.

Repository:

- [bagche/mamoochi](https://github.com/bagche/mamoochi)
- [mamoochi.bagche.app](https://mamoochi.bagche.app/)

## Why It Exists

A content system is usually built twice.

First as a website.  
Then again as a pattern.

Mamoochi is the second version of that instinct: take the decisions that keep repeating across small publishing and product sites, and make them explicit enough that another project can start from them.

## What It Explores

The project explores how much structure a Jamstack framework should provide before it becomes too rigid.

It cares about:

- Nuxt and Vue as the application layer,
- static or edge-friendly output,
- content that stays close to the repository,
- deployment assumptions that work well on Cloudflare,
- project conventions that can be reused across Bagche surfaces.

The framework ambition is the interesting part. A starter helps one project begin. A framework tries to preserve decisions across projects: layout conventions, content rules, routing shape, deployment assumptions, and editing workflow.

## How It Works

Mamoochi keeps the architecture close to the web stack rather than hiding it behind a large CMS. Nuxt handles routing and rendering. Vue handles the component surface. Cloudflare-friendly deployment keeps the runtime small.

That shape makes the project useful for content-heavy products that need a public face and a practical editing workflow without a database-backed application at the center.

## What I Learned

Open-source publishing frameworks are small infrastructure bets. They encode what the maintainer believes a site should need and what it should avoid.

Mamoochi is useful because it makes those beliefs visible: keep the source inspectable, keep the deployment path simple, and let writing or product iteration remain the center of the work.

## Current Status

Active archive. The repository remains part of the Bagche technical story, but this page should avoid implying a large product ecosystem until the public framework API and usage story are clearer.

## Next Steps

- [ ] Document the framework API and expected project structure.
- [ ] Add a comparison with Totoro and Mohetios.dev.
- [ ] Capture the Cloudflare deployment assumptions.
- [ ] Decide whether Mamoochi is the main Bagche technical story or one project inside the workspace.
