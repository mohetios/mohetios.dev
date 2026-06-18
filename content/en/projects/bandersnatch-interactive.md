---
title: Bandersnatch Interactive
description: A project note on an archived HTML5 video experiment - exploring branching playback, local files, and browser state machines.
date: 2019-01-16
updated: 2025-12-16
status: Stable archive
tags:
  - interactive-video
  - html5-video
  - javascript
  - branching-narrative
repo: https://github.com/mohetios/BandersnatchInteractive
website: https://mohetios.github.io/BandersnatchInteractive/
featured: true
---

Bandersnatch Interactive is an old open-source browser experiment for playing an interactive story from a local video file. It was built around _Black Mirror: Bandersnatch_, but it is not an official Netflix product, a clone of Netflix, or a content distribution project.

The narrow idea was this: if the viewer already has the long local video file, can a browser page restore the branching structure with simple web primitives?

Repository:

- [mohetios/BandersnatchInteractive](https://github.com/mohetios/BandersnatchInteractive)
- [Interactive demo](https://mohetios.github.io/BandersnatchInteractive/)

## Why It Exists

Interactive video is often described as a media problem, but the useful part of this experiment was closer to product state.

A linear file has time.  
A branching story has choices.  
The player has to map one to the other without owning the media.

That constraint made the project small enough to build and interesting enough to remember.

## What It Explores

The project treats branching playback as a state machine in the browser.

Each choice changes which segment should play next. The player watches current time, shows overlays at decision points, handles keyboard input, moves between segments, and tries to keep the viewer inside the story instead of exposing the mechanics.

The local-file constraint matters. The app does not upload or host the source video. The browser becomes the runtime, and the interaction layer sits beside the user's own file.

## How It Works

The implementation sits on top of the native HTML5 video element:

- drag a local video file into the page,
- use a timing map to identify story segments,
- show choice overlays at the right moments,
- seek to the next segment after a decision,
- support keyboard shortcuts, fullscreen playback, and subtitles.

There is no backend and no account system. The hard part is coordination: time, input, subtitles, fullscreen behavior, browser codec support, and the story graph all have to agree.

## What I Learned

The durable lesson is that interactivity does not always need a large platform. Sometimes it needs a careful model of state.

The project also made browser media feel less abstract. Codec behavior, local-file permissions, subtitle timing, and fullscreen UX are not side details. For this kind of tool, they are the product surface.

## Current Status

Stable archive. It remains useful as a small record of interactive-video thinking, but it should be treated as a historical experiment rather than an actively maintained media product.

## Next Steps

- [ ] Preserve the timing-map design in a separate lab note.
- [ ] Add screenshots of the choice overlay and local-file flow.
- [ ] Document what changed in browser media APIs since the original release.
- [ ] Decide whether the project should remain archived or receive a small maintenance pass.
