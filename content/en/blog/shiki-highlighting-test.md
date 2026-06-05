---
title: Shiki highlighting smoke test
description: A short notebook post to verify build-time syntax highlighting, line annotations, and code copy on Mohetios.dev.
date: 2026-06-05
tags:
  - testing
  - velite
  - shiki
draft: false
---

This page exists to test the content viewer: Shiki blocks, annotation transformers, table of contents, and the client-side copy button.

## Plain TypeScript block

```ts
type Post = {
  title: string
  path: string
  draft?: boolean
}

export function getPost(path: string, posts: Post[]) {
  return posts.find((post) => post.path === path.toLowerCase())
}
```

## Line annotations

Use `// [!code highlight]`, `// [!code focus]`, and `// [!code error]` in fenced blocks.

```ts
const config = {
  theme: 'github-dark',
  copyButton: true
}

const route = '/en/blog/shiki-highlighting-test' // [!code highlight]
const isDraft = true // [!code focus]
const broken = null.toString() // [!code error]
```

## Diff block

```diff
- const theme = 'nord'
+ const theme = 'github-dark'
```

## Word highlight

```ts
const site = 'Mohetios.dev'
const stack = ['Nuxt', 'Velite', 'Shiki'] // [!code word:Velite]
```

## Shell snippet

```bash
pnpm add @shikijs/rehype shiki @shikijs/transformers
velite build
```

## Inline code

Use `rehypeShiki` in `velite.config.ts` and confirm copy buttons appear after hydration.

## Checklist

- Highlighted lines are visible but calm
- Focus and error lines render correctly
- Diff add/remove backgrounds show up
- Copy button copies the block text
- Mobile TOC appears when enough headings exist
