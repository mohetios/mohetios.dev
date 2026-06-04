# Mohetios.dev

> Where ideas unfold into systems.

Personal publishing site and engineering notebook for Ali Zemani — a bilingual (English/Persian) space for long-form posts, lab experiments, project writeups, and a reading log, with a small built-in operations dashboard (inbox, leads, notifications) behind authentication.

## Tech Stack

- **Nuxt 4** + **Nuxt UI** + **Tailwind CSS** — frontend
- **Velite** — typed, build-time content from Markdown (replaces Nuxt Content)
- **GraphQL Yoga** + **nuxt-graphql-client** — single `/graph` API
- **Cloudflare D1** + **Drizzle ORM** — database
- **Cloudflare Pages / Nitro** — hosting and SSR/prerendering
- **Cloudflare Workers** — inbound email + queue-driven notifications/email delivery
- **JWT auth** with role-based permissions (`OWNER` / `MEMBER`)
- **`@nuxtjs/i18n`** — English + Persian (RTL)
- **PWA** via `@vite-pwa/nuxt`

## Project Structure

```txt
app/         Frontend Vue app (pages, components, composables, layouts, middleware)
server/      Nitro backend — GraphQL (/graph), D1/Drizzle, auth, services, REST under api/
shared/      Pure contracts shared by app and server (GraphQL docs, types, constants)
content/     Velite content source, split by locale (en/ and fa/)
workers/     Standalone Cloudflare Workers (email inbound, system queue consumer)
migrations/  Drizzle SQL migrations
i18n/locales UI labels for English and Persian
public/      Static assets and content images
```

Content collections live under `content/{locale}`:

- `blog/` — long-form posts and book notes
- `lab/` — experiments, prototypes, research notes
- `projects/` — project writeups
- `about.md`, `contact.md` — standalone pages

## Prerequisites

- **Node.js** 20+ and **pnpm** (see `packageManager` in `package.json`)
- A **Cloudflare** account with **D1** and **Queues** for full backend/Worker development

## Environment

Copy the example file and fill in the values:

```bash
cp .env.example .env
```

At minimum, set `NUXT_JWT_SECRET` to a long random string for auth to work. The remaining keys cover mail, web-push (VAPID), Turnstile, and the public base URL — see `.env.example` for the full list.

## Local Development

Install dependencies:

```bash
pnpm install
```

Run the full stack (content watcher, Nuxt, and both Workers) with one command:

```bash
pnpm dev
```

Run a narrower slice when you don't need everything:

```bash
pnpm dev:web      # Velite + Nuxt only
pnpm dev:workers  # email + system Workers only
```

## Quality Checks

These run across all code — Nuxt app, server, shared, and Workers:

```bash
pnpm check        # lint + typecheck
pnpm lint         # eslint .
pnpm typecheck    # nuxt + workers
pnpm format:check # prettier
```

Remove cached/build folders (`.nuxt`, `.output`, `.velite`, `dist`, etc.):

```bash
pnpm clean
```

## Database

The schema lives in `server/models/schema.ts` and migrations are written to `migrations/`.

```bash
pnpm db:generate  # generate a migration from schema changes
pnpm db:push      # apply migrations to the local D1 database
pnpm db:studio    # open Drizzle Studio
```

## Build & Deploy

`build`, `preview`, and `deploy` all target the Cloudflare Pages output in `dist/`:

```bash
pnpm build    # velite build + nuxt build (cloudflare_pages preset)
pnpm preview  # wrangler pages dev dist
pnpm deploy   # wrangler pages deploy dist
```

## Content Notes

English is the default locale. Persian content renders RTL through the app-level locale direction binding. Keep localized UI strings in `i18n/locales/en.json` and `i18n/locales/fa.json`; keep prose content in the matching `content/{locale}` tree.

Blog images should use real post or book-cover assets when possible, stored under `public/content` and referenced from frontmatter with `thumbnail`.

## GraphQL Feature Pattern

The API is GraphQL-first and served from a single `/graph` endpoint.

For a new query, add fields and types to `server/schema.ts`, add a resolver in `server/queries/{feature}.ts`, register it in `server/queries/index.ts`, add the client operation in `shared/graphql/queries/{feature}.query.gql`, then call the generated `Gql{Feature}()` function from app code.

For a new mutation, add fields and types to `server/schema.ts`, add a resolver in `server/mutations/{feature}.ts`, register it in `server/mutations/index.ts`, add the operation in `shared/graphql/mutations/{feature}.mutation.gql`, then call the generated `Gql{Feature}()` function from app code.

If a feature needs storage, add tables to `server/models/schema.ts`, generate a Drizzle migration, and use the table directly in the resolver. Add service layers only when a resolver grows past about 300 lines, DB logic repeats three or more times, testing becomes hard, or the feature becomes business-critical.

## Workers

Two standalone Cloudflare Workers run alongside the app (started by `pnpm dev` or individually via `pnpm dev:email` / `pnpm dev:system`):

- **email** — receives inbound email, parses it, and stores it in the inbox
- **system** — consumes queues to send admin push notifications and deliver inbox email replies

## License

Code is licensed under the terms in [LICENSE](./LICENSE). Written content and images may have separate ownership or source-specific restrictions.
