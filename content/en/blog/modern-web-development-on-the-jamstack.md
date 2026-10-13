---
title: Modern Web Development on the JAMstack
date: 2021-08-11T12:29:12.649Z
thumbnail: /content/Modern-Web-Development-on-the-JAMstack.webp
description: 'Notes on the JAMstack model: prerendered markup, CDN delivery, APIs, and the tradeoffs behind fast, secure web publishing.'
tags:
- book-notes
- jamstack
- static-sites
- apis
- web-performance
---

_Modern Web Development on the JAMstack_ is a compact introduction to separating content preparation, delivery, and runtime behavior. Its central question is whether a page needs to be rebuilt for every visitor, or can be prepared before the request arrives.

## Build Time and Runtime

The book covers prerendered markup, CDN delivery, JavaScript and APIs, content management, deployment workflows, and migration. Durable content moves into build time; dynamic interactions receive a separate execution path.

Mohetios.dev follows a related model: Markdown is the source, Velite prepares content at build time, and Nuxt presents it on Cloudflare Pages. Forms, comments, and protected data still need backend behavior, permissions, and explicit caching decisions.

## Architecture Before Tools

Developers evaluating static generators or CMSs will find a concise architectural starting point. The tools have changed, but the build-versus-runtime distinction remains useful. Long builds, difficult previews, and dynamic features spread across services are costs to consider alongside simpler delivery.

## Get the Book

- Netlify PDF: [Modern Web Development on the JAMstack](https://www.netlify.com/pdf/oreilly-modern-web-development-on-the-jamstack.pdf)
