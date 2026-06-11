---
title: Interactive Video as a State Machine
description: Notes from Bandersnatch Interactive on turning a local HTML5 video file into a branching playback experience.
date: 2019-01-16
updated: 2025-12-16
status: Exploring
tags:
  - interactive-video
  - html5-video
  - state-machines
  - javascript
---

Bandersnatch Interactive looks like a video player, but the useful mental model is a state machine.

The video file is linear. The experience is not. Each branch depends on the current timestamp, the available choices, the viewer's input, and the next segment that should begin after a decision. Once the project is framed this way, the implementation becomes easier to reason about.

Project repository:

- [mehotkhan/BandersnatchInteractive](https://github.com/mehotkhan/BandersnatchInteractive)

## The Runtime

The browser already provides a capable media runtime through the HTML5 video element. That means the application can focus on orchestration instead of decoding or transporting media.

The local-file constraint keeps the system honest. There is no server to hide complexity behind. The page needs to load the file, track playback time, draw the interaction layer, switch segments, and keep controls responsive.

## The State

The important state is small:

- The current segment.
- The next decision window.
- The selected branch.
- Whether fullscreen mode is active.
- Subtitle and control preferences.
- Recovery behavior when the viewer jumps forward or backward.

The hard part is not storing this state. The hard part is keeping it synchronized with video time, browser focus, fullscreen APIs, and keyboard input.

## The Lesson

Interactive media does not always need a large framework. For a constrained experience, a timestamp map and a disciplined state machine can be enough.

The project is a reminder that browser primitives are still powerful when the product problem is narrow and the data model is explicit.

## Task Checklist

- [ ] Recover the segment timing model as a readable table.
- [ ] Document the transition rules between segments.
- [ ] Add notes about subtitles, fullscreen behavior, and keyboard shortcuts.
- [ ] Compare this implementation with the later SohaSimurgh interactive movie player.
