<!-- PERSIAN_EDITORIAL_ENGINE_START -->

## Persian editorial engine

For any task that creates, rewrites, translates, localizes, audits, or updates Persian-language output:

1. Read `editorial/fa/ENTRYPOINT.md` and follow its load order: `core.md` and `profiles/ali/voice.md` always, then only the relevant parts of `reference.md` and the nearest scoped context.
2. Use `editorial/fa/profiles/ali/` as the default author profile unless the task explicitly selects another one.
3. Preserve factual meaning, temporal status, ownership, uncertainty, frontmatter, URLs, code, identifiers, placeholders, and runtime-sensitive Markdown.
4. Keep project facts, timelines, terminology, and status out of `editorial/fa/`.
5. Run `pnpm editorial:check` before completion.

Do not duplicate the editorial rules here; `editorial/fa/` is canonical. This block is managed by `scripts/setup-ai-coding-stack.sh`.

<!-- PERSIAN_EDITORIAL_ENGINE_END -->
