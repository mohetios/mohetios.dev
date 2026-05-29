---
title: Bandersnatch Interactive
description: "A browser-based HTML5 video player that restores the interactive structure of Black Mirror: Bandersnatch from a local video file."
date: 2019-01-16
updated: 2025-12-16
status: Stable archive
tags:
  - javascript
  - html5-video
  - interactive-media
  - subtitles
repo: https://github.com/mehotkhan/BandersnatchInteractive
website: https://mehotkhan.github.io/BandersnatchInteractive/
featured: true
---

Bandersnatch Interactive is a small browser project with a narrow job: take the long local video file for _Black Mirror: Bandersnatch_ and make it playable as an interactive experience in the browser.

The project sits on top of the native HTML5 video element. Instead of streaming or repackaging the media, it asks the viewer to drag the local video file into the page, then uses segment timing, keyboard controls, fullscreen mode, and choice overlays to move through the branching structure.

That constraint is what makes the project interesting. It treats the browser as a playback runtime rather than a media host. The application does not need a backend, account system, or upload flow; it only needs to coordinate time, state, input, subtitles, and transitions without breaking immersion.

Repository:

- [mehotkhan/BandersnatchInteractive](https://github.com/mehotkhan/BandersnatchInteractive)
- [Interactive demo](https://mehotkhan.github.io/BandersnatchInteractive/)

Engineering notes:

- Local file playback keeps the tool lightweight and avoids hosting the source media.
- Segment navigation turns a linear video file into an interactive graph.
- Keyboard controls make testing and replaying branches much faster.
- Multi-language subtitle support matters because the interaction layer should not assume one audience.
- Browser codec behavior is part of the product surface, not just an implementation detail.

The repository became one of my most visible open-source experiments because it solved a very specific media problem with simple web primitives.

## Next Tasks

- [ ] Preserve the timing-map design in a separate lab note.
- [ ] Add screenshots of the choice overlay and local-file flow.
- [ ] Document what changed in browser media APIs since the original release.
- [ ] Decide whether the project should remain archived or receive a maintenance pass.
