---
title: Persian Word Cloud
description: A Python package for generating Persian and mixed Persian-English word clouds.
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

The project started from a practical gap: many text visualization tools assume left-to-right Latin text, clean token boundaries, and font behavior that does not match Persian writing. A word cloud is visually simple, but it exposes several deeper text-processing concerns when the language changes.

Repository:

- [mehotkhan/persian-word-cloud](https://github.com/mehotkhan/persian-word-cloud)

The package focuses on making the common path easy:

- Install the package from Python tooling.
- Feed it Persian text.
- Render readable word-cloud images.
- Support mixed Persian and English output where needed.
- Use masks for shaped visual results.

The value is not only the generated image. It is the small compatibility layer around language, rendering, and developer expectations. That is why the repository continues to be useful as an example of localized tooling: the algorithm can be general, but the last mile has to respect the script.

## Next Tasks

- [ ] Add a minimal modern usage example.
- [ ] Document font and mask handling for Persian output.
- [ ] Compare the package with current Python word-cloud tooling.
- [ ] Link the project to the Persian text tools lab note.
