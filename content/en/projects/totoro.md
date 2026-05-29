---
title: Totoro
description: A Jamstack blog starter built with Nuxt, Decap CMS, Cloudflare Pages, and static publishing constraints.
date: 2023-08-24
updated: 2023-09-09
status: Archive
tags:
  - nuxt
  - jamstack
  - decap-cms
  - cloudflare-pages
  - static-site
repo: https://github.com/mehotkhan/totoro
website: https://totoro.alizemani.ir/
---

Totoro is a small Jamstack publishing starter: Nuxt for the application shell, Decap CMS for Git-backed editing, and Cloudflare Pages for deployment.

The repository is not only a template. It is a record of a specific publishing idea: keep a personal or small-team site editable without turning it into a database-backed product. Content lives close to the code, deployment is reproducible, and the runtime stays thin.

That constraint matters because publishing tools often drift toward too much machinery. Totoro keeps the stack close to the static-site model while still giving the editor a friendly workflow.

Repository:

- [mehotkhan/totoro](https://github.com/mehotkhan/totoro)

## Design Notes

The project sits between a hand-edited Markdown site and a full CMS platform.

- Nuxt provides routing, layout, and the application layer.
- Decap CMS gives non-terminal editing through Git.
- Cloudflare Pages handles static deployment and preview-friendly hosting.
- The content model stays inspectable because posts are still files.

The useful lesson is that a publishing system should not hide its source of truth. If the site is meant to last for years, the content should remain portable even when the UI around it changes.

## Next Tasks

- [ ] Document the original content model and folder layout.
- [ ] Compare Totoro with the current Mohetios.dev content pipeline.
- [ ] Add screenshots or archive links if the deployed site is still available.
- [ ] Decide whether this page should become a historical project page or fold into a broader publishing-systems note.

