---
title: WebAssembly in Action
thumbnail: /content/wasm-in-actions.webp
description: WebAssembly in Action introduces the WebAssembly stack and walks
  you through the process of writing and running browser-based applications.
  Expert developer Gerard Gallant gives you a firm foundation of the structure
  of a module, HTML basics, JavaScript Promises, and the WebAssembly JavaScript
  API.
date: 2023-09-01T16:33:46.294Z
tags:
- book-notes
- webassembly
- browser-performance
- native-modules
- javascript-interop

toc: false
intro: false
cat: library
comments: true
newsletter: true
---

Bringing compiled code into a browser introduces a boundary around memory, data transfer, and execution. _WebAssembly in Action_ explains how to work across that boundary, using C/C++ modules with JavaScript and HTML. Gerard Gallant gives module integration as much attention as compilation.

## Working with Modules

The book moves from module structure and compilation to reusing C++ code, calling JavaScript, and communicating through function pointers. Dynamic linking, web workers and pthreads, Node.js execution, the WebAssembly Text Format, debugging, and testing follow.

This progression makes the application contract visible: imports and exports, memory ownership, and the interface between languages all need to be understood. A successful build is only one stage of that work.

## Prerequisites and Scope

Basic C/C++, JavaScript, and HTML are useful prerequisites. The book suits developers bringing existing code or a specific computation to the web. Current toolchain and browser documentation should accompany the examples, and performance gains need measurement against build and data-transfer costs.

## Get the Book

- Manning Publications (Buy): [WebAssembly in Action](https://www.manning.com/library/webassembly-in-action)
