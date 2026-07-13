---
title: Interactive Video as a State Machine  
description: Notes from Bandersnatch Interactive on turning a local HTML5 video file into a branching playback experience.  
date: 2019-01-16  
updated: 2026-06-12  
status: Refining  
tags:
- interactive-video
- state-machines
- html5-video
- branching-narrative
- media-tools
- browser-apis
---

Bandersnatch Interactive is an old experimental open-source project, but I still like the problem it touches.

On the surface, it looks like a small HTML5 video player. You load a local video file, watch it in the browser, and make choices at specific moments.

But the useful mental model is not “video player”.

The useful mental model is a state machine.

The video file is linear.  
The experience is not.

A normal video player asks one main question:

> What time is the video at?

An interactive video player has to ask more:

> Which segment are we in?  
> Is this timestamp inside a decision window?  
> Which choices are available now?  
> What did the viewer select before?  
> Which future segment should start next?  
> What should happen if the viewer jumps, pauses, rewinds, or goes fullscreen?

That is where the project becomes interesting.

Project repository:

- [mohetios/BandersnatchInteractive](https://github.com/mohetios/BandersnatchInteractive)
    

## What This Project Was

Bandersnatch Interactive was not a commercial product and not a replacement for Netflix.

It was a local, open-source experiment around the interaction pattern of branching video.

Netflix already had the official interactive experience on its own platform. This project explored the same kind of playback logic from another angle: what happens if the browser is only given a local video file, a map of decision points, and a small JavaScript runtime?

No streaming backend.  
No custom media platform.  
No server-side orchestration.  
No hidden product infrastructure.

Just a browser, a video element, timestamps, choices, subtitles, keyboard controls, and a branching model.

That constraint made the project useful.

It forced the logic to stay visible.

## The Local-File Constraint

The player depends on the user selecting a local video file.

That sounds like a limitation, but technically it is one of the most important parts of the project.

When the file stays local, the browser is not pretending to be a full streaming service. The page does not host or distribute the movie. The application is only an interaction layer around a media file the user already has.

That changes the architecture.

The app does not need to decode video itself.  
The app does not need to stream video chunks.  
The app does not need to manage accounts or sessions.  
The app does not need a backend.

The HTML5 video element already provides the low-level media runtime: playback, seeking, buffering, tracks, fullscreen behavior, and browser-level controls.

So the application can focus on orchestration.

That is the real project:

not playing video, but coordinating meaning around video time.

## Interactive Video Is Time Plus State

A branching film is not only a sequence of clips.

It is a graph.

Some nodes are story segments.  
Some edges are choices.  
Some transitions are automatic.  
Some paths depend on previous decisions.  
Some branches loop back.  
Some endings are terminal.  
Some jumps are recovery paths.

In a simple implementation, the graph can be represented as a timestamp map:

- segment start time
    
- segment end time
    
- decision window start
    
- decision window end
    
- choice labels
    
- default choice
    
- selected choice
    
- next segment target
    
- recovery behavior
    

Once the experience is framed this way, the player stops being a collection of video hacks and becomes a small runtime.

The runtime observes the video clock, compares the current time with the segment map, opens the choice UI when needed, records the decision, and seeks to the next segment.

That is a state machine.

Not in a heavy academic sense. In a practical product sense.

There is a current state.  
There are allowed transitions.  
There are events.  
There are side effects.  
There is recovery when the user does something unexpected.

The browser provides time.  
The application provides structure.

## The State That Matters

The important state is small, but sensitive to timing:

- current segment
    
- current playback time
    
- next decision window
    
- visible choice layer
    
- selected branch
    
- default branch when the viewer does not choose
    
- previous choices
    
- watch history
    
- subtitle preference
    
- playback speed
    
- fullscreen state
    
- keyboard input state
    
- recovery behavior after seek, rewind, or jump
    

None of these fields are complicated alone.

The difficulty is synchronization.

Video time changes continuously. User input is irregular. Fullscreen APIs behave differently across browsers. Native video controls can conflict with the custom choice layer. Subtitles need to remain readable. Keyboard shortcuts must not break the player. Seeking forward or backward can move the viewer outside the expected story path.

That is why a disciplined state machine matters.

Without it, the player becomes a pile of timestamp conditions.

With it, every event has a place:

- `timeupdate` checks whether a decision window should open
    
- `keydown` maps shortcuts to player actions
    
- `click` records a choice
    
- `seeked` reconciles the current segment
    
- `fullscreenchange` updates layout state
    
- `ended` decides whether the experience is complete or should jump to another segment
    

The implementation can stay small because the model is explicit.

## The Choice Layer

The choice UI is the most visible part of the project, but it is not the whole system.

A good choice layer has to do a few things at the same time:

- appear at the correct timestamp
    
- show the correct options
    
- keep video playback feeling continuous
    
- allow keyboard and mouse selection
    
- fall back to a default option
    
- disappear cleanly after a decision
    
- avoid fighting with native video controls
    
- work in fullscreen
    
- stay readable over changing video backgrounds
    

That last part is easy to underestimate.

Interactive media is not only data and branching logic. It is timing, attention, visual hierarchy, and interruption design.

The viewer is already watching something. The UI is entering the scene for a few seconds. It must be clear enough to act on, but not so heavy that it breaks the film.

That is a different kind of interface design from dashboards or forms.

It is closer to stage direction.

## Branching Without a Framework

One lesson from the project is that interactive media does not always require a large framework.

For a narrow experience, browser primitives can go far:

- `HTMLVideoElement` for playback
    
- text tracks for subtitles
    
- fullscreen APIs
    
- keyboard events
    
- local file selection
    
- DOM overlays
    
- timestamp maps
    
- local storage for watch history and preferences
    

This is not the right architecture for every interactive film platform.

But for a constrained local experiment, it is enough.

That is the point.

A small explicit model can be more useful than a large generic abstraction, especially when the product problem is narrow and the data model is known.

## Why It Still Matters

This project is old, but it still matters to me for a few reasons.

First, it is a useful reminder that the web platform is powerful.

A browser can load local files, control media playback, draw overlays, track time, respond to keyboard input, manage subtitles, store preferences, and create a complete interactive experience without a backend.

Second, it shows that a media product can often be understood as state plus transitions.

That idea appears in many places later: onboarding flows, interactive courses, product tours, branching forms, game-like learning tools, decision trees, and AI-guided interfaces.

Third, it became a seed for later experiments.

After this project, I explored similar patterns with other interactive story ideas and forks of the same model. The specific movie was never the real point. The real point was the pattern:

a linear medium made interactive through state.

## What I Would Change Now

If I were rebuilding this project today, I would not only “modernize the UI”.

I would make the internal model clearer.

I would separate the project into a few explicit layers:

- media runtime
    
- timeline parser
    
- segment graph
    
- interaction state machine
    
- choice overlay
    
- subtitle and accessibility layer
    
- persistence layer
    
- debug/devtools panel
    
- story package format
    

That last one matters.

The original project is tied to a specific experience. A better future version should become a small generic interactive video engine.

A story package could define:

- media duration
    
- segments
    
- choices
    
- labels
    
- default paths
    
- subtitles
    
- endings
    
- recovery rules
    
- metadata
    
- test paths
    

Then the player would not be only a Bandersnatch-specific experiment.

It would become a reusable local-first branching video player.

## Preservation Without Confusion

There is also a preservation angle.

Interactive media is fragile. A normal movie can be exported as a file. An interactive movie depends on timing, state, platform support, UI behavior, and branching logic. If the platform disappears or stops supporting that interaction model, the experience can become hard to revisit.

That does not mean every experimental player should distribute copyrighted content.

It should not.

But it does mean the interaction model itself is worth studying.

How were choices represented?  
How did timing work?  
How did the UI interrupt the story?  
How did the system recover when the viewer reached an ending?  
How did previous decisions affect later scenes?

Those are design and engineering questions.

Bandersnatch Interactive is a small open-source note around those questions.

## What I Learned

The main lesson is simple:

Interactive video is not video with buttons.

It is a time-based state machine.

The media file gives you continuity.  
The segment graph gives you structure.  
The choice layer gives the viewer agency.  
The runtime keeps all of them synchronized.

When those pieces are explicit, the project becomes easier to debug, document, and extend.

When they are implicit, every timestamp becomes a trap.

## Next Checklist

-  Recover the segment timing model as a readable table.
    
-  Document all transition rules between segments.
    
-  Separate the timeline map from the player runtime.
    
-  Add a story package format for future interactive videos.
    
-  Improve the choice overlay for mobile, fullscreen, and keyboard use.
    
-  Add accessibility notes for subtitles, contrast, focus, and reduced motion.
    
-  Add a debug panel for current segment, active decision window, and next target.
    
-  Improve local watch history and reset behavior.
    
-  Add tests for timestamp boundaries and transition rules.
    
-  Document browser support and codec limitations clearly.
    
-  Clean up the README so the project is framed as a local open-source interaction experiment.
    
-  Compare this implementation with later interactive movie/player experiments.
    

Bandersnatch Interactive started as a small HTML player for a specific interactive film pattern.

The deeper version is more useful:

a study in how linear media can become interactive when time, state, choices, and transitions are treated as one system.