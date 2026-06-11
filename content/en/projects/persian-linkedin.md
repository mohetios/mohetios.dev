---
title: Persian LinkedIn
description: A browser extension that improves LinkedIn readability for Persian users with RTL fixes and font controls.
date: 2017-12-07
updated: 2018-01-03
status: Stable archive
tags:
  - browser-extension
  - persian
  - rtl
  - typography
  - linkedin
repo: https://github.com/mehotkhan/persian-linkedin
---

Persian LinkedIn is a small browser extension for a very specific irritation: Persian text inside LinkedIn can render technically correct while still feeling uncomfortable to read.

The extension adds right-to-left treatment for LinkedIn posts and gives users font choices. It was forked from the Persian Twitter extension idea, then adapted to the LinkedIn surface.

Repository:

- [mehotkhan/persian-linkedin](https://github.com/mehotkhan/persian-linkedin)

## Why It Matters

Localization is usually discussed as translation, but Persian interfaces often fail at a lower layer: direction, line rhythm, font selection, and mixed-language text.

Persian LinkedIn is not a large product, but it is a good example of localized tooling as repair work. The extension does not ask LinkedIn to become a Persian-first product. It changes the browser surface just enough to make the existing product more usable.

## Design Notes

- Browser extensions can patch third-party UX without waiting for platform support.
- RTL fixes need to be scoped carefully so they do not corrupt mixed Persian-English content.
- Font selection is a product feature when the default font makes reading feel wrong.
- Small tools like this are useful signals for bigger design systems: language support has to start in layout, not only in copy.

## Next Tasks

- [ ] Review whether the extension still works on the current LinkedIn DOM.
- [ ] Add before/after screenshots from the archived repository.
- [ ] Document the selector strategy and what broke over time.
- [ ] Connect this page to the broader Persian text tooling lab note.
