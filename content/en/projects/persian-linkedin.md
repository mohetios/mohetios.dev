---
title: Persian LinkedIn
description: A project note on a browser extension that improved Persian readability on LinkedIn through RTL fixes and font controls.
date: 2017-12-07
updated: 2018-01-03
status: Stable archive
tags:
- browser-extension
- persian
- rtl
- typography
- localization
- linkedin
repo: https://github.com/mohetios/persian-linkedin
---

Persian LinkedIn is a small browser extension for a very specific irritation: Persian text inside LinkedIn can render technically correctly while still feeling uncomfortable to read.

The extension was adapted from the Persian Twitter extension idea. Its job was narrow: improve right-to-left treatment and give Persian readers better font choices on a product that was not designed around them.

Repository:

- [mohetios/persian-linkedin](https://github.com/mohetios/persian-linkedin)

## Why It Exists

Localization is often discussed as translation, but Persian web UX often breaks one layer lower.

Direction is wrong.  
Line rhythm feels off.  
The default font is hard to read.  
Mixed Persian-English text becomes awkward.

Persian LinkedIn exists as repair work. It does not ask LinkedIn to become a Persian-first product. It changes the browser surface just enough to make the existing product more readable.

## What It Explores

The project explores browser extensions as small local tools for language support.

That kind of tool is not glamorous, but it is practical. A browser extension can patch a third-party interface for a specific reading community without waiting for the platform to prioritize the issue.

## How It Works

At a high level, the extension applies scoped RTL and typography changes to LinkedIn pages. The careful part is scope: a fix that helps Persian text can damage mixed-language content if selectors or direction rules are too broad.

The useful engineering questions are:

- where should the extension apply RTL behavior?
- which text surfaces need font controls?
- how should mixed Persian-English content remain readable?
- what breaks when the third-party DOM changes?

## What I Learned

Small tools can reveal large product assumptions.

Persian LinkedIn is not a big project, but it points to a durable lesson: language support starts in layout, not only in copy. Typography and direction are part of usability.

## Current Status

Stable archive. The project should be treated as a historical extension unless it is reviewed against the current LinkedIn DOM.

## Next Steps

- [ ] Review whether the extension still works on the current LinkedIn DOM.
- [ ] Add before/after screenshots from the archived repository.
- [ ] Document the selector strategy and what broke over time.
- [ ] Connect this page to the broader Persian text tooling lab note.
