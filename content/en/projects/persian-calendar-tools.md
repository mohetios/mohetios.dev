---
title: Persian Calendar Tools
description: A project note on small Vue calendar experiments - exploring Jalali date UI, RTL layout, and localized interaction details.
date: 2023-12-16
updated: 2024-03-07
status: Archive
tags:
- persian-calendar
- jalali
- vue
- rtl
- localization
- date-picker
repo: https://github.com/mohetios/zcalendar
website: https://mohetios.github.io/zcalendar/
---

Persian Calendar Tools collects two related Vue experiments: `simple-taghvim` and `zcalendar`. They are small projects, but they sit inside a larger problem I keep returning to: Persian interfaces should not feel like translated left-to-right components.

A calendar makes that problem visible quickly. The grid is simple. The expectations are not.

Repositories:

- [mohetios/zcalendar](https://github.com/mohetios/zcalendar)
- [mohetios/simple-taghvim](https://github.com/mohetios/simple-taghvim)

## Why It Exists

Many date components treat localization as a label swap. Change the month names, maybe switch direction, and the job looks done.

For Persian calendar UI, that is rarely enough. Jalali dates, RTL reading, mixed Persian-English contexts, compact mobile layouts, and keyboard or pointer interaction all affect whether the component feels native.

These experiments were a way to study that smaller layer of product quality.

## What It Explores

The projects explore calendar UI as a localized primitive:

- month and weekday labels that fit the language,
- Jalali date display,
- readable dense grids in RTL layouts,
- interaction patterns that do not assume a Gregorian mental model,
- a small component that could later support travel, publishing, reminders, or personal tools.

The point is not to claim a complete date library. The point is to preserve the interface lessons that appear when a common component meets a real local language.

## How It Works

Both projects use Vue to keep the interaction layer direct and inspectable. The visible output is a calendar or date picker, but the real work is in display decisions: how dates are named, how the grid reads, how compact controls behave, and how mixed-direction text stays understandable.

## What I Learned

Localized tooling often fails in the quiet places.

It is not only translation. It is font rhythm, direction, spacing, labels, defaults, and small assumptions that were never designed for Persian readers. A calendar is a useful test because every wrong assumption becomes visible in one screen.

## Current Status

Archive. The repositories are useful as historical UI experiments and as input for future Persian-first components, but they should not be presented as a current maintained calendar toolkit.

## Next Steps

- [ ] Decide whether `simple-taghvim` and `zcalendar` should stay one combined project page.
- [ ] Add implementation notes about date conversion and display logic.
- [ ] Capture the public `zcalendar` demo as a visual reference.
- [ ] Extract reusable lessons for a lab note on localized date interfaces.
