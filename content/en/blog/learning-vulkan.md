---
title: Learning Vulkan
date: 2026-03-22
thumbnail: /content/learning-vulkan-cover.webp
description: Notes on Parminder Singh's practical introduction to Vulkan and the foundations of explicit GPU programming.
tags:
  - books
  - vulkan
  - gpu-programming
  - graphics
---

## Reading Notes

_Learning Vulkan_ is useful as a more approachable path into a difficult API. Vulkan has a steep setup curve, and a book that walks through the moving parts can save a lot of scattered reading.

The goal is not just to draw a triangle. The goal is to understand why so many objects, buffers, descriptors, and synchronization points exist.

## Useful Ideas

### Setup Teaches the Model

The long initialization path is not incidental. It exposes how Vulkan thinks about hardware, queues, memory, surfaces, and presentation.

### Resources Need Ownership

Buffers, images, descriptors, and command buffers all need explicit lifetime management. That makes ownership a core design concern.

### Rendering Is Coordination

A frame is the result of coordinated CPU and GPU work. Vulkan makes that coordination visible.

## Why I Keep It Nearby

This is a useful companion when rebuilding the Vulkan mental model from the ground up.

## Get the Book

- Google Books: [Learning Vulkan](https://books.google.com/books/about/Learning_Vulkan.html?id=eczcDgAAQBAJ)
