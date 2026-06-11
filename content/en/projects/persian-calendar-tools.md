---
title: Persian Calendar Tools
description: A small set of Vue calendar experiments around simple Persian calendar interfaces and date interaction.
date: 2023-12-16
updated: 2024-03-07
status: Archive
tags:
  - vue
  - persian-calendar
  - jalali
  - date-picker
repo: https://github.com/mehotkhan/zcalendar
website: https://mehotkhan.github.io/zcalendar/
---

Persian Calendar Tools collects two related calendar experiments: `simple-taghvim` and `zcalendar`.

They are small Vue projects, but the product problem is deeper than rendering a grid of days. Calendar UI becomes difficult as soon as the interface needs to respect local date systems, language direction, short labels, keyboard movement, and compact mobile layouts.

Repositories:

- [mehotkhan/zcalendar](https://github.com/mehotkhan/zcalendar)
- [mehotkhan/simple-taghvim](https://github.com/mehotkhan/simple-taghvim)

## Design Notes

Calendar components look generic until they meet local expectations.

- Month and weekday labels need language-aware layout.
- The component should avoid assuming Gregorian mental models in the visible UI.
- Dense date grids must stay readable in RTL contexts.
- A small calendar can become a reusable primitive for travel, publishing, reminders, and personal tools.

The useful part of these repositories is the iteration path: start with a simple calendar, then turn the repeated interaction details into a better component.

## Next Tasks

- [ ] Decide whether `simple-taghvim` and `zcalendar` should stay one combined project page.
- [ ] Add implementation notes about date conversion and display logic.
- [ ] Capture the public `zcalendar` demo as a visual reference.
- [ ] Extract reusable lessons for a lab note on localized date interfaces.
