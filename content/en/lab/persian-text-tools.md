---
title: Persian Text Tools
description: Notes on the recurring engineering details behind Persian Word Cloud, Persian LinkedIn, and other RTL text experiments.
date: 2017-07-05
updated: 2022-12-16
status: Reference
tags:
- persian
- rtl
- typography
- localization
- text-processing
---

Persian text support often fails in small ways before it fails completely.

A layout can technically render Persian characters while still choosing the wrong direction, using a weak font, breaking mixed English and Persian phrases, or making visual output unreadable. Projects like Persian Word Cloud and Persian LinkedIn came from those small failures.

Related repositories:

- [mohetios/persian-word-cloud](https://github.com/mohetios/persian-word-cloud)
- [mohetios/persian-linkedin](https://github.com/mohetios/persian-linkedin)
- [mohetios/faPoems](https://github.com/mohetios/faPoems)
- [mohetios/faPoems-markdown](https://github.com/mohetios/faPoems-markdown)

## The Pattern

The recurring work is not glamorous:

- Pick fonts that support Persian forms cleanly.
- Respect right-to-left direction instead of only translating strings.
- Handle mixed Persian and English text without corrupting order.
- Make browser extensions apply direction and font choices to hostile third-party layouts.
- Make visualization tools understand that tokenization and rendering are language-specific.

These are not separate concerns. Typography, layout, parsing, and product UX all meet at the same point: can a Persian user read this comfortably?

## Why It Matters

Localized tooling is often treated as polish. In practice, it is infrastructure.

For Persian users, a word cloud generator needs script-aware rendering. A LinkedIn improvement extension needs direction and font controls. A bilingual product like Safarnak needs RTL behavior to be part of the design system, not an afterthought.

This lab thread collects the small engineering decisions that make Persian interfaces feel native instead of merely supported.

## Task Checklist

- [ ] Document font choices and fallback behavior for Persian UI.
- [ ] Add examples of mixed Persian-English rendering failures.
- [ ] Compare browser-extension fixes with app-level design-system fixes.
- [ ] Connect Persian calendar and poem-rendering work to this note.
