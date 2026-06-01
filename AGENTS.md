# AGENTS.md

## Working Agreement

* Make small, focused changes.
* Inspect existing patterns before editing.
* Prefer simple code over architecture ceremony.
* Preserve user work. Do not remove unrelated files.
* Use `rg` / `rg --files` for search.
* Do not run long-running commands unless explicitly requested.
* Do not run deploy commands unless explicitly requested.
* Do not introduce new frameworks or large abstractions without a clear need.
* Keep the project enjoyable to modify.

## Default Checks

Use targeted checks when practical:

* `pnpm lint`
* `pnpm typecheck`
* focused file inspection

Do not run these unless the user asks or the change requires them:

* `pnpm dev`
* `pnpm build`
* deployment commands
* destructive database commands

If a command is expensive, risky, or environment-dependent, explain the reason before running it.

## Project Identity

Mohetios.dev is a personal engineering notebook, portfolio, lab, and lightweight freelance operations surface.

The site should feel:

* minimal
* editorial
* technical
* calm
* honest
* not SaaS-hype
* not over-designed
* not over-architected

Brand line:

> Mohetios.dev — Where ideas unfold into systems.

## Current Stack

* Nuxt 4
* Nuxt UI
* Tailwind CSS
* Velite for typed/build-time content
* Cloudflare Pages / Nitro
* Cloudflare D1
* Drizzle ORM
* GraphQL Yoga
* nuxt-graphql-client
* JWT-based basic dashboard auth

Important: do not use Nuxt Content APIs. Nuxt Content has been removed from this project. Do not use `queryCollection`, `ContentRenderer`, or Nuxt Content composables.

## Main Folder Model

Use the Nuxt 4 structure:

```txt
app/      -> frontend Vue app
server/   -> Nitro backend / GraphQL / D1 / auth
shared/   -> pure contracts shared by app and server
content/  -> Velite content source
drizzle/  -> Drizzle migrations
public/   -> static assets
```

## App Folder Rules

Application UI lives in `app/`.

Expected shape:

```txt
app/
├── components/
├── composables/
├── layouts/
├── middleware/
└── pages/
```

Use `app/` for:

* pages
* layouts
* Vue components
* client composables
* route middleware
* dashboard UI
* content UI
* Nuxt UI components

Do not put server-only logic in `app/`.

No D1 access, Drizzle client, JWT secret handling, password hashing, Cloudflare bindings, or GraphQL resolver logic should live in `app/`.

## Server Folder Rules

The server is GraphQL-first and intentionally compact.

Expected shape:

```txt
server/
├── routes/
│   └── graph.ts
├── schema.ts
├── queries/
│   ├── index.ts
│   └── me.ts
├── mutations/
│   ├── index.ts
│   ├── login.ts
│   ├── register.ts
│   └── logout.ts
├── models/
│   ├── schema.ts
│   └── client.ts
└── utils/
    ├── auth.ts
    ├── crypto.ts
    ├── env.ts
    └── id.ts
```

Use:

* `server/routes/graph.ts` for the `/graph` endpoint and GraphQL Yoga setup.
* `server/schema.ts` for GraphQL SDL.
* `server/queries/*.ts` for Query resolvers.
* `server/mutations/*.ts` for Mutation resolvers.
* `server/models/schema.ts` for Drizzle table definitions.
* `server/models/client.ts` for D1/Drizzle client creation.
* `server/utils/*.ts` for compact server helpers.

Do not create these unless explicitly needed:

```txt
server/api/graphql.post.ts
server/api/graphql.get.ts
server/graphql/
server/typeDefs/
server/repositories/
server/services/
server/actions/
server/guards/
server/crypto/
server/cloudflare/
```

Keep the backend flat.

## GraphQL Route

Use `/graph`, not `/api/graphql`.

The single route file is:

```txt
server/routes/graph.ts
```

This file may contain:

* GraphQL Yoga creation
* schema creation
* context creation
* GET/POST method handling
* production GraphiQL blocking
* resolver connection

Do not split GraphQL setup into `gql.ts`, `context.ts`, `schema.ts`, and `resolvers.ts` unless the file becomes genuinely hard to maintain.

## GraphQL Schema

Use one schema file:

```txt
server/schema.ts
```

Keep all GraphQL SDL there.

Only split the schema later if:

* it exceeds roughly 300–400 lines
* merge conflicts become common
* feature domains become hard to scan

For now, one schema file is preferred.

## Resolver Style

Resolvers should be simple and direct.

Allowed pattern:

```txt
resolver file = resolver + DB logic
```

For example:

```txt
server/queries/inbox.ts
server/mutations/inbox.ts
```

These files may directly import Drizzle tables from:

```txt
server/models/schema.ts
```

Do not create repository/service/action layers by default.

Only split DB logic out when:

* the resolver file exceeds roughly 250–300 lines
* the same DB logic is repeated 3+ times
* testing becomes hard
* the feature becomes business-critical

## Models

Use `server/models/` only for database foundation:

```txt
server/models/
├── schema.ts
└── client.ts
```

`schema.ts` contains Drizzle table definitions.

`client.ts` creates the D1/Drizzle client from Cloudflare/Nitro runtime bindings.

Do not create `users.repository.ts`, `inbox.repository.ts`, or similar files by default.

## Shared Folder Rules

Use `shared/` only for pure contracts used by both app and server.

Expected shape:

```txt
shared/
├── graphql/
│   ├── fragments/
│   ├── queries/
│   └── mutations/
├── types/
├── constants/
└── schemas/
```

Allowed in `shared/`:

* `.gql` / `.graphql` operation documents
* pure TypeScript types
* pure constants
* pure validation schemas
* pure formatting or normalization helpers

Forbidden in `shared/`:

* Vue imports
* Nuxt composables
* Nitro / H3 imports
* Drizzle client
* D1 bindings
* JWT secret logic
* password hashing
* Cloudflare runtime access
* server resolver code

## GraphQL Client Generation

Use `nuxt-graphql-client`.

GraphQL operations must live in `.gql` / `.graphql` files.

Preferred location:

```txt
shared/graphql/
├── fragments/
├── queries/
└── mutations/
```

Generated functions should be used in app code:

```ts
const result = await GqlMe()
const result = await GqlLogin({ input })
const result = await GqlRegister({ input })
```

Use `useGqlToken(token)` after login/register and when restoring an auth session.

Do not write manual `$fetch('/graph')` calls if generated GraphQL functions are available.

## Auth Pattern

Auth is basic and dashboard-focused.

Current scope:

* username + password
* no email requirement
* password hashing
* JWT token
* first registered user becomes `ADMIN`
* later registration is blocked unless explicitly enabled
* dashboard is protected by middleware

Use:

```txt
app/composables/useAuth.ts
app/middleware/auth.ts
app/pages/login.vue
app/pages/register.vue
```

Server-side auth belongs in:

```txt
server/mutations/login.ts
server/mutations/register.ts
server/mutations/logout.ts
server/queries/me.ts
server/utils/auth.ts
server/utils/crypto.ts
```

Do not leak password hashes, salts, or tokens.

Do not log passwords or JWT tokens.

Login errors should be generic.

## Dashboard Pattern

Dashboard UI lives under:

```txt
app/pages/dashboard/
app/components/dashboard/
app/layouts/dashboard.vue
```

Dashboard pages should use the dashboard layout and auth middleware.

Expected dashboard pages:

```txt
app/pages/dashboard/
├── index.vue
├── inbox.vue
├── leads.vue
├── comments.vue
├── forms.vue
└── analytics.vue
```

Use Nuxt UI dashboard primitives where useful.

Keep the dashboard small:

* Overview
* Leads
* Inbox
* Comments
* Forms
* Analytics

Do not add:

* Automations
* System
* Settings
* CMS/admin content manager

Dashboard content management is not needed because content is Jamstack/Velite-based.

## Content

Content is managed by Velite, not Nuxt Content.

Expected content areas:

```txt
content/
├── writing/
├── lab/
├── projects/
└── pages/
```

Do not assume localized content paths unless the repo confirms them.

Do not use Nuxt Content APIs.

When editing content systems, inspect Velite configuration first.

## Internationalization

If the project uses `@nuxtjs/i18n`, preserve the existing locale strategy.

General rules:

* Keep visible UI labels localized if the existing screen is localized.
* Preserve Persian RTL support.
* Use logical CSS properties where practical.
* Do not hardcode English text inside reusable components if existing patterns use locale files.

If the current page is not localized yet, follow nearby project patterns rather than inventing a new i18n structure.

## Styling

Use Nuxt UI and Tailwind CSS.

Visual direction:

* calm
* minimal
* editorial
* technical
* warm light theme
* green primary accent
* clean spacing
* subtle borders
* no generic SaaS clutter

Avoid:

* heavy enterprise dashboard UI
* unnecessary gradients
* noisy charts
* too many badges
* overusing icons
* complex layout abstractions

## Feature Development Path

For a query feature:

```txt
1. Add GraphQL fields/types to server/schema.ts
2. Add resolver file in server/queries/{feature}.ts
3. Register it in server/queries/index.ts
4. Add shared GraphQL document in shared/graphql/queries/{feature}.query.gql
5. Use generated Gql{Feature}() function in app page/component
```

For a mutation feature:

```txt
1. Add mutation/type changes to server/schema.ts
2. Add resolver file in server/mutations/{feature}.ts
3. Register it in server/mutations/index.ts
4. Add shared GraphQL document in shared/graphql/mutations/{feature}.mutation.gql
5. Use generated Gql{Feature}() function in app page/component
```

If persistence is needed:

```txt
1. Add table to server/models/schema.ts
2. Generate Drizzle migration
3. Use the table directly inside the resolver file
```

Do not add repository/service/action layers unless the code has clearly outgrown the compact pattern.

## Example Feature Touch Points

For an inbox feature, touch only what is needed:

```txt
server/schema.ts
server/models/schema.ts
server/queries/inbox.ts
server/mutations/inbox.ts
server/queries/index.ts
server/mutations/index.ts
shared/graphql/fragments/inboxMessage.fragment.gql
shared/graphql/queries/inbox.query.gql
shared/graphql/mutations/inbox.mutation.gql
app/pages/dashboard/inbox.vue
app/components/dashboard/InboxMessageList.vue
app/components/dashboard/InboxMessageDetail.vue
```

Avoid creating extra layers.

## Database

Use Drizzle ORM with Cloudflare D1.

Drizzle config should point to:

```txt
server/models/schema.ts
```

Migrations live in:

```txt
drizzle/migrations/
```

Do not run database push/migration commands unless the user asks or the task clearly requires it.

If changing database schema, report:

* table changes
* migration file created
* command needed to apply migration
* any data risk

## Commands

Preferred inspection commands:

```bash
rg "pattern"
rg --files
pnpm lint
pnpm typecheck
```

Only run when appropriate:

```bash
pnpm build
pnpm dev
pnpm db:generate
pnpm db:push
pnpm db:studio
```

Never run deployment commands unless explicitly requested.

## Git Safety

Before editing, inspect relevant files.

Do not remove unrelated files.

Do not rewrite large areas unless the task requires it.

If there are unexpected changes in the workspace, preserve them.

If the workspace is not a git repository, be extra careful and make minimal edits.

## Implementation Style

Prefer:

* direct code
* clear naming
* small files
* local logic
* generated GraphQL functions
* Nuxt UI components
* simple Drizzle queries in resolvers

Avoid:

* abstractions too early
* extra folders
* duplicate state systems
* manual GraphQL request wrappers when generated functions exist
* hidden magic
* large “framework inside framework” patterns

## Completion Report

After code edits, report:

* files changed
* files created
* files removed
* commands run
* checks passed/failed
* assumptions
* follow-up needed

Keep reports short and practical.
