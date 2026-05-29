---
title: Konar IoT Experiments
description: Notes from Konar Studio's ESP01 signaling and Arduino sonar experiments, where tiny C++ sketches became a way to test physical interaction ideas.
date: 2020-08-18
updated: 2020-08-20
status: Archive
tags:
  - konar-studio
  - iot
  - arduino
  - esp01
  - c-plus-plus
---

Konar Studio was not only a web front page. It also held small hardware experiments where the useful question was physical: can a cheap board sense, signal, or react well enough to become part of an installation or prototype?

Related repositories:

- [konar-studio/ESP01-Signaling-Server](https://github.com/konar-studio/ESP01-Signaling-Server)
- private `konar-studio/Arduino-sound-sonar`
- [konar-studio/Front-Page](https://github.com/konar-studio/Front-Page)

## The Experiment Shape

The IoT work is small, but it belongs in the lab because hardware experiments rarely start as polished products. They start as proof:

- Can the ESP01 act as a lightweight signaling node?
- Can an Arduino sonar sketch produce a useful interaction signal?
- How much logic belongs on the board, and how much belongs in the surrounding web system?
- What is the smallest prototype that can test the idea in the room, not only on a screen?

That is the useful difference between product software and lab software. The code is not the whole system. The board, sensor, signal quality, power, enclosure, and the surrounding experience all become part of the design surface.

## Why It Belongs Here

Konar's IoT repositories show a different side of the same building habit: make a small technical surface, test the constraint directly, then decide whether it deserves a larger product.

For web projects, the constraint is usually content, deployment, data, or UI. For IoT experiments, the constraint is physical behavior. Does the device respond? Is the signal noisy? Can the interaction be repeated? Does the prototype survive outside the developer's desk?

## Task Checklist

- [ ] Review the public ESP01 signaling code and document the runtime assumptions.
- [ ] Decide whether the private Arduino sonar repository can be described publicly beyond its name.
- [ ] Add a note on how Konar's web front page connected to the hardware experiments, if it did.
- [ ] Extract reusable lessons for future device-to-web prototypes.

