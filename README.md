# Mohetios.dev

Personal publishing site for Ali Zemani: a bilingual engineering notebook, project archive, and reading log focused on software, web systems, product engineering, physics, and technical experiments.

The site is built with Nuxt 4, Nuxt UI, Nuxt Content, Tailwind CSS, Velite, and `@nuxtjs/i18n`. It is designed for Cloudflare Pages.

## What Lives Here

- `content/en/blog` and `content/fa/blog`: long-form posts and book notes
- `content/en/lab` and `content/fa/lab`: experiments, prototypes, and research notes
- `content/en/projects` and `content/fa/projects`: project writeups
- `content/{locale}/about.md`: localized standalone pages
- `app/`: Nuxt application code, components, pages, utilities, and shared CSS
- `i18n/locales`: UI labels for English and Persian
- `public/content`: images and post thumbnails

## Local Development

Install dependencies:

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
```

Run focused checks:

```bash
pnpm lint
pnpm typecheck
pnpm format:check
```

Build for Cloudflare Pages:

```bash
pnpm build:pages
```

Preview the Pages build locally:

```bash
pnpm preview:pages
```

Deploy the generated Pages output:

```bash
pnpm deploy:pages
```

## Content Notes

English is the default locale. Persian content renders RTL through the app-level locale direction binding. Keep localized UI strings in `i18n/locales/en.json` and `i18n/locales/fa.json`; keep prose content in the matching `content/{locale}` tree.

Blog images should use real post or book-cover assets when possible, stored under `public/content` and referenced from frontmatter with `thumbnail`.

## GraphQL Feature Pattern

For a new query, add fields and types to `server/schema.ts`, add a resolver in `server/queries/{feature}.ts`, register it in `server/queries/index.ts`, add the client operation in `shared/graphql/queries/{feature}.query.gql`, then call the generated `Gql{Feature}()` function from app code.

For a new mutation, add fields and types to `server/schema.ts`, add a resolver in `server/mutations/{feature}.ts`, register it in `server/mutations/index.ts`, add the operation in `shared/graphql/mutations/{feature}.mutation.gql`, then call the generated `Gql{Feature}()` function from app code.

If a feature needs storage, add tables to `server/models/schema.ts`, generate a Drizzle migration, and use the table directly in the resolver. Add repository/service/action layers only when a resolver grows past about 300 lines, DB logic repeats three or more times, testing becomes hard, or the feature becomes business-critical.

## License

Code is licensed under the terms in [LICENSE](./LICENSE). Written content and images may have separate ownership or source-specific restrictions.
