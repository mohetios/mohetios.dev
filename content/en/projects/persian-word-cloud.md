---
title: Persian Word Cloud
description: A project note on a Python package for Persian and mixed Persian-English word clouds, with attention to script, font, and rendering details.
date: 2017-07-05
updated: 2021-12-20
status: Stable archive
tags:
  - python
  - nlp
  - persian
  - word-cloud
  - visualization
repo: https://github.com/mehotkhan/persian-word-cloud
featured: true
---

Persian Word Cloud is a Python package for generating word-cloud images from Persian text. It builds on the existing `word_cloud` ecosystem while adapting the output for Persian and mixed Persian-English content.

The project started from a practical gap: many text visualization tools assume left-to-right Latin text, clean token boundaries, and font behavior that does not match Persian writing.

Repository:

- [mehotkhan/persian-word-cloud](https://github.com/mehotkhan/persian-word-cloud)

## Why It Exists

A word cloud looks simple.

Count words.  
Place words.  
Render an image.

Then Persian enters the system, and the hidden assumptions become visible: direction, shaping, fonts, tokenization, mixed-language text, and how a generated image should read to a human.

Persian Word Cloud exists to make that common visualization workflow usable for Persian text instead of treating Persian as an edge case.

## What It Explores

The package explores localized text tooling at the rendering layer.

It is not trying to be a complete NLP system. Its value is smaller and more practical: take a familiar Python workflow and make the common Persian path easier.

The package focuses on:

- Persian input text,
- mixed Persian and English output,
- readable font handling,
- shaped visual results through masks,
- compatibility with developer expectations around the Python word-cloud ecosystem.

## How It Works

The package wraps and adapts existing word-cloud generation so Persian users do not have to rediscover the same rendering fixes for every project.

That compatibility layer is the important part. The algorithm can be general, but the last mile has to respect the script.

## What I Learned

Localized developer tools are often small bridges.

They do not need to replace the whole ecosystem. They need to make a real workflow possible for people whose language was not the default design target. Persian Word Cloud is useful as a record of that kind of work.

## Current Status

Stable archive. The project remains visible and useful as a Persian text-tooling artifact, but it should be reviewed before being described as actively maintained against current Python packaging and visualization expectations.

## Next Steps

- [ ] Add a minimal modern usage example.
- [ ] Document font and mask handling for Persian output.
- [ ] Compare the package with current Python word-cloud tooling.
- [ ] Link the project to the Persian text tools lab note.
