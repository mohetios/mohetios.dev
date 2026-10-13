---
title: Vulkan Programming Guide
date: 2026-03-22
thumbnail: /content/vulkan-programming-guide-cover.webp
description: Notes on Graham Sellers and John Kessenich's guide to Vulkan, explicit graphics programming, rendering pipelines, and GPU control.
tags:
- book-notes
- vulkan
- gpu-programming
- graphics-pipeline
- explicit-apis
---

_Vulkan Programming Guide_ examines rendering below the engine layer. Graham Sellers and John Kessenich explain how explicit decisions about resources, commands, and state form the path from application data to GPU execution and a displayed image.

## The Complete Rendering Path

Instance and device setup, queues, command buffers, memory, synchronization, shaders, pipelines, and presentation form the material. The shader is considered within the system that supplies and executes it.

Explicit control places responsibility on the application. Resource lifetimes, coordinated work, and clear pipeline state belong in the design. A correct operation performed at the wrong time can still produce an incorrect frame.

## Working Below the Engine

Developers seeking low-level graphics understanding, direct resource control, or deeper rendering investigation will find a conceptual reference. It demands more attention to setup than an engine tutorial. Current specifications and tools remain necessary for the Vulkan version being used.

## Get the Book

- Khronos: [Vulkan Programming Guide](https://www.khronos.org/news/permalink/vulkan-programming-guide-the-official-guide-to-learning-vulkan)
