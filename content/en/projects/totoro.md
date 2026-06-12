---
title: Totoro
description: A project note on a Nuxt and Decap CMS Jamstack starter - exploring Git-backed publishing, static deployment, and durable content ownership.
date: 2023-08-24
updated: 2023-09-09
status: Archive
tags:
  - nuxt
  - jamstack
  - decap-cms
  - cloudflare-pages
  - static-blog
repo: https://github.com/mehotkhan/totoro
website: https://totoro.alizemani.ir/
---

Totoro is a small Jamstack publishing starter: Nuxt for the application shell, Decap CMS for Git-backed editing, and Cloudflare Pages for deployment.

It is not just another portfolio template. It is a record of a specific publishing idea: keep a personal or small-team site editable without turning it into a database-backed product.

Repository:

- [mehotkhan/totoro](https://github.com/mehotkhan/totoro)

## Why It Exists

Publishing systems tend to drift.

First there is a folder of Markdown files.  
Then a CMS appears.  
Then the CMS becomes the source of truth.  
Then moving the site becomes harder than writing for it.

Totoro was a way to hold a smaller line: give the editor a usable interface, but keep the content close to the repository.

## What It Explores

The project explores the space between hand-edited Markdown and a full CMS platform.

It uses:

- Nuxt for routing, layout, and the application layer,
- Decap CMS for browser-based Git editing,
- Cloudflare Pages for static deployment,
- file-based content so the archive stays portable.

The product question is simple: how much editing comfort can a site gain without hiding the content behind a runtime service?

## How It Works

Totoro keeps the runtime thin. The site can be deployed as a static public surface, while Decap CMS provides a friendlier writing interface on top of Git.

That makes the source of truth inspectable. Posts are still files. The repository still tells the story of the site. The CMS improves the workflow without taking ownership of the archive.

## What I Learned

A publishing system should not make its own future migration difficult.

If a personal site is meant to last for years, the content should remain portable even when the interface around it changes. Totoro helped clarify that idea, and Mohetios.dev is a later version of the same concern with a different content pipeline.

## Current Status

Archive. Totoro is useful as a historical publishing-system project and as context for the current Mohetios.dev content architecture.

## Next Steps

- [ ] Document the original content model and folder layout.
- [ ] Compare Totoro with the current Mohetios.dev content pipeline.
- [ ] Add screenshots or archive links if the deployed site is still available.
- [ ] Decide whether this page should remain a historical project page or fold into a broader publishing-systems note.
