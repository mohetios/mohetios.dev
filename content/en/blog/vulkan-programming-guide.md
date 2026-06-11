---
title: Vulkan Programming Guide
date: 2026-03-22
thumbnail: /content/vulkan-programming-guide-cover.webp
description: Notes on Graham Sellers and John Kessenich's guide to Vulkan, explicit graphics programming, rendering pipelines, and GPU control.
tags:
  - books
  - vulkan
  - gpu-programming
  - graphics-api
---

## Reading Notes

_Vulkan Programming Guide_ is about explicit graphics programming. Vulkan gives the developer far more control than older high-level graphics APIs, but that control comes with more responsibility.

This book is useful because it treats rendering as a system: instance setup, devices, queues, command buffers, memory, synchronization, shaders, and presentation all have to fit together.

## Useful Ideas

### Explicit Control Has a Cost

Vulkan removes many hidden decisions. That is powerful, but it means the application must manage details that other APIs used to smooth over.

### Synchronization Is Central

Graphics bugs are often timing bugs. Vulkan makes synchronization a first-class part of the design.

### The Pipeline Is the Program

Rendering is not just shader code. It is the whole pipeline of data, state, commands, and GPU execution.

## Why I Keep It Nearby

This is a reference for understanding graphics work below the engine layer. It is useful when performance, control, or deep debugging matters.

## Get the Book

- Khronos: [Vulkan Programming Guide](https://www.khronos.org/news/permalink/vulkan-programming-guide-the-official-guide-to-learning-vulkan)
