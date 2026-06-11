---
title: Personal Publishing Systems
description: Notes on the evolution from personal front pages to Git-backed Nuxt publishing systems and the current Mohetios.dev workshop.
date: 2019-10-07
updated: 2026-05-28
status: Active
tags:
  - jamstack
  - nuxt
  - content-systems
  - cloudflare-pages
  - static-sites
---

The recurring project is not "make a website." It is building a personal publishing system that stays useful after the first design fades.

Several repositories circle this idea:

- [mehotkhan/totoro](https://github.com/mehotkhan/totoro)
- [mehotkhan/front](https://github.com/mehotkhan/front)
- [mehotkhan/front_old](https://github.com/mehotkhan/front_old)
- [mehotkhan/Inbox](https://github.com/mehotkhan/Inbox)
- [mehotkhan/mohetios.dev](https://github.com/mehotkhan/mohetios.dev)

## The Pattern

The stack changes, but the product pressure stays the same:

- The site needs to be easy to write in.
- The content should survive framework changes.
- The deployment path should be boring.
- The homepage should show current work without becoming a dashboard.
- The archive should remain readable years later.

That is why Git-backed content keeps returning. Markdown is not perfect, but it is durable. A personal site should not require a database just to remember what you were thinking in 2023.

## Useful Design Rules

Keep the editing loop close to the source of truth. A CMS can help, but it should not trap the content.

Make the content model explicit. Blog posts, lab notes, projects, and standalone pages age differently, so they should not all be forced into one bucket.

Treat the site as infrastructure for future work. A good personal site is not only a portfolio; it is a place where unfinished systems can accumulate enough context to become finished later.

## Task Checklist

- [ ] Compare Totoro's Decap CMS model with the current Velite content pipeline.
- [ ] Add a short architecture diagram for the Mohetios.dev publishing flow.
- [ ] Decide where `front`, `front_old`, and `Inbox` belong in the public story.
- [ ] Write migration notes for moving old content into the current `content/en` and `content/fa` structure.
