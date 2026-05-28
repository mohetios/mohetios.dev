# AGENTS.md

## Working Agreement

- Prefer small, focused changes that match the existing Nuxt 4, Nuxt UI, Nuxt Content, and Tailwind CSS structure.
- Do not run `pnpm dev`, `pnpm build`, or deployment commands unless the user explicitly asks for them.
- Use targeted checks by default: `pnpm lint`, `pnpm typecheck`, or focused file inspection.
- Preserve user work. This workspace may not be a git repository, so avoid broad rewrites and never remove unrelated files.
- Use `rg`/`rg --files` for search and inspect existing patterns before editing.

## App Structure

- Application code lives in `app/`.
- Localized content lives only under `content/fa` and `content/en`.
- Blog posts are stored in `content/{locale}/blog`.
- Lab notes are stored in `content/{locale}/lab`.
- Projects are stored in `content/{locale}/projects`.
- Standalone pages, such as About, are stored as `content/{locale}/about.md`.

## Internationalization

- The active locale comes from `@nuxtjs/i18n`.
- Default locale is English (`en`) and routes use the locale prefix strategy.
- Query Nuxt Content by the current locale prefix, for example `/fa/blog/...` or `/en/projects/...`.
- Persian pages should render RTL through the app-level `html dir` binding.
- Keep UI labels in `i18n/locales/fa.json` and `i18n/locales/en.json`.

## Styling

- The theme intentionally follows the old `mohet.ir` feel: monochrome primary color, pale sticky header, slate dark mode, Vazirmatn body font, and FarhangDot logo treatment for RTL.
- Shared typography and Markdown rendering styles live in `app/assets/css/main.css`.
- Keep Markdown content styling language-neutral where possible, and use logical CSS properties for RTL/LTR compatibility.

## Formatting And Linting

- VS Code should use Prettier for formatting and ESLint for code fixes.
- Nuxt ESLint uses the generated flat config through `eslint.config.mjs`.
- `eslint-config-prettier` is appended to avoid style-rule conflicts with Prettier.
- Before finishing code edits, run `pnpm lint` when practical. Use `pnpm typecheck` for TypeScript or Nuxt config changes.
