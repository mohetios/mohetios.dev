# AGENTS.md

## Prime Directive

Mohetios.dev runs on Cloudflare/Nitro. Server code must be small, edge-safe, low-CPU, and predictable.

When changing backend, GraphQL, auth, inbox, queues, D1, or workers code, optimize for:

- low CPU per request
- few D1/KV/R2/HTTP subrequests
- small memory footprint
- simple control flow
- explicit permissions and validation
- minimal files changed
- no accidental architecture growth

Do not generate heavy abstractions, repository layers, generic service frameworks, or framework-inside-framework patterns.

## Agent Operating Mode

Before editing:

1. Inspect existing files and local patterns with `rg` / `rg --files`.
2. Identify the smallest safe change set.
3. Prefer editing existing files over creating new ones.
4. Preserve user work and unrelated files.
5. Do not invent APIs, aliases, folder paths, env names, generated functions, or GraphQL operations. Inspect first.

While editing:

- Make focused changes.
- Keep server paths hot and lean.
- Avoid broad rewrites unless explicitly requested.
- Do not add dependencies without approval.
- Do not run deploy, migration, destructive DB, long-running dev, or build commands unless explicitly requested.

After editing, report:

- files changed
- files created
- commands run
- checks passed/failed
- assumptions
- follow-up needed

Keep reports short and practical.

## Current Project Identity

Mohetios.dev is a personal engineering notebook, portfolio, lab, and lightweight freelance operations surface.

Brand line:

> Mohetios.dev — Where ideas unfold into systems.

The product should feel:

- minimal
- editorial
- technical
- calm
- honest
- not SaaS-hype
- not over-designed
- not over-architected

## Current Stack

- Nuxt 4
- Nuxt UI
- Tailwind CSS
- Velite for typed/build-time content
- Cloudflare Pages / Nitro
- Cloudflare Workers for separate background/email workers
- Cloudflare D1
- Cloudflare Queues
- Drizzle ORM
- GraphQL Yoga at `/graph`
- `nuxt-graphql-client`
- JWT dashboard auth
- `@nuxtjs/i18n` with English + Persian / RTL
- PWA via `@vite-pwa/nuxt`

Important: Nuxt Content has been removed. Do not use Nuxt Content APIs such as `queryCollection`, `ContentRenderer`, or Nuxt Content composables.

## Main Folder Model

Use the compact Nuxt 4 structure:

```txt
app/       -> Vue app, pages, layouts, components, composables, middleware
server/    -> Nitro backend, GraphQL, D1, auth, compact domain services
shared/    -> pure contracts shared by app and server
content/   -> Velite markdown source
workers/   -> separate Cloudflare workers such as email/system workers
migrations/ -> Drizzle/D1 migrations
public/    -> static assets
```

Do not create alternative roots unless the project already uses them.

## App Folder Rules

Application UI lives in `app/`.

Use `app/` for:

- pages
- layouts
- Vue components
- client composables
- route middleware
- dashboard UI
- content UI
- Nuxt UI components

Never put server-only logic in `app/`:

- no D1 access
- no Drizzle client
- no JWT secret handling
- no password hashing
- no Cloudflare binding access
- no GraphQL resolver logic
- no queue producer/consumer implementation except calling existing GraphQL/API surfaces

## Server Folder Rules

The backend is GraphQL-first and intentionally compact.

Expected shape:

```txt
server/
├── routes/
│   └── graph.ts
├── api/
├── schema.ts
├── queries/
├── mutations/
├── services/
├── models/
│   ├── schema.ts
│   └── client.ts
└── utils/
```

Use:

- `server/routes/graph.ts` for `/graph` and GraphQL Yoga setup.
- `server/schema.ts` for GraphQL SDL.
- `server/queries/*.ts` for Query resolvers.
- `server/mutations/*.ts` for Mutation resolvers.
- `server/models/schema.ts` for Drizzle table definitions.
- `server/models/client.ts` for D1/Drizzle client creation.
- `server/utils/*.ts` for compact server helpers.
- `server/services/{domain}/*.ts` only when resolver logic is reused, complex, or business-critical.
- `server/api/**/*.ts` only when a plain HTTP endpoint is genuinely needed.

Do not create by default:

```txt
server/api/graphql.post.ts
server/api/graphql.get.ts
server/graphql/
server/typeDefs/
server/repositories/
server/actions/
server/guards/
server/cloudflare/
```

No repository layer. No generic CRUD wrappers. Keep the backend flat.

## GraphQL Rules

Use `/graph`, not `/api/graphql`.

Feature path:

```txt
1. Update server/schema.ts
2. Add or update server/queries/{feature}.ts or server/mutations/{feature}.ts
3. Register resolver in server/queries/index.ts or server/mutations/index.ts
4. Add operation in shared/graphql/queries or shared/graphql/mutations
5. Use generated Gql*() functions in app code when practical
```

Resolver style:

- Resolver files may directly use Drizzle tables.
- Keep resolvers simple and direct.
- Extract to `server/services/{domain}` only when logic repeats 3+ times, exceeds roughly 250–300 lines, or needs focused testing.
- Avoid N+1 resolver patterns.
- Select only columns needed by the UI/API.
- Add pagination or explicit limits to list queries.
- Keep GraphQL payloads small and shaped for the current screen.

Do not split schema/resolver infrastructure into many tiny framework files unless maintenance has clearly become painful.

## GraphQL Client Rules

GraphQL operations live in `.gql` / `.graphql` files under:

```txt
shared/graphql/
├── fragments/
├── queries/
└── mutations/
```

Prefer generated functions:

```ts
const result = await GqlMe()
const result = await GqlLogin({ input })
const result = await GqlRegister({ input })
```

Use `useGqlToken(token)` after login/register and when restoring an auth session.

Avoid new manual `$fetch('/graph')` wrappers unless modifying an existing file that already uses that local pattern. For substantial new UI, add shared GraphQL documents and use generated `Gql*()` functions.

## Cloudflare Worker Performance Rules

Treat every server request as an edge hot path.

Prefer:

- fewer imports in server entry paths
- simple functions over classes
- direct validation and direct DB access
- bounded loops
- SQL filtering/aggregation instead of JavaScript post-processing
- pagination over full-table reads
- streaming or small payloads over buffering
- immutable module-level constants only
- async I/O over CPU-heavy transformations

Avoid:

- CPU-heavy loops in request handlers
- unbounded JSON parsing or serialization
- loading large datasets then filtering in JavaScript
- full-text fuzzy search in Worker code
- recursive tree walking in request paths
- large regex over untrusted input
- `JSON.parse(JSON.stringify(...))` cloning
- module-level mutable request state
- Node-only libraries when a Web API or small helper is enough
- large server dependencies for trivial utilities
- expensive markdown/content processing at request time when Velite/build-time data can be used

When a task is not required for the response:

- use the existing queue/system-worker pattern for durable background work
- use `waitUntil` only where the current runtime utility already supports it
- use Queues for email delivery, notifications, indexing, and slow side effects
- use Workflows only for genuinely long multi-step jobs
- use Durable Objects only for stateful coordination, realtime, WebSockets, or strong per-entity serialization

Never hide required work in an untracked floating promise.

## Request Scope and Global State

Cloudflare isolates can be reused across requests.

Allowed at module scope:

- constants
- pure config maps
- compiled regex constants with safe patterns
- immutable helper data
- lazy immutable caches that do not contain user/request data

Forbidden at module scope:

- current user
- request object
- auth token
- per-request DB result
- locale from current request
- mutable arrays/maps storing request data
- any request-scoped state that can leak between users

Pass request state through function arguments, resolver context, or local variables.

## Promise Rules

Every promise must be one of:

- `await`ed
- `return`ed
- intentionally passed to an approved `waitUntil`/queue mechanism

No floating promises.

Use `await` when the response depends on the result. Use queue/waitUntil only for side effects that can safely complete after the response.

## D1 / Drizzle Rules

D1 is the source of truth for relational app data.

Prefer:

- Drizzle queries that select only required columns
- `where`, `limit`, `offset`/cursor pagination, and `orderBy` in SQL
- SQL aggregates for counts and dashboard summaries
- indexed filter/sort columns
- single-purpose queries over generic data loaders
- D1 `batch()` or project-approved transaction patterns for atomic multi-step direct-D1 work

Avoid:

- loading all rows then filtering in JS
- list queries without limits
- N+1 query loops
- broad `select *` for dashboard cards
- per-row follow-up queries when a join or batched query is possible
- schema changes without migration notes
- assuming classic SQLite transaction behavior without checking current D1/Drizzle support

If changing schema, report:

- table changes
- indexes added/removed
- migration file created
- command needed to apply migration
- data risk

Do not run migration/push/studio commands unless explicitly requested.

## KV / Cache Rules

D1 remains the source of truth. KV is only for read-optimized, eventually consistent snapshots or cache.

Use KV for:

- public read-heavy snapshots
- dashboard summary cache when exact real-time data is not required
- lightweight computed counters
- external integration response cache
- content metadata cache if build-time data is not enough

Do not use KV for:

- auth/session truth
- permissions
- inbox message truth
- financial/client records
- data that requires immediate consistency

Cache keys must be explicit and versioned, for example:

```txt
dashboard:home:v1:{ownerId}:{locale}
content:index:v1:{locale}
public:stats:v1
```

Every cached value needs:

- source of truth
- TTL or invalidation strategy
- safe fallback when cache misses or stale data appears

## Runtime Env Rules

For deployed Nitro/Cloudflare server code:

- read Cloudflare bindings from the request/event runtime using the existing project utility pattern
- read app secrets/config with `useRuntimeConfig(event)` where the project does that
- do not rely on plain `process.env` in deployed server runtime code
- do not hand-write Cloudflare binding types when generated types exist
- never expose secrets in public runtime config

Separate Workers do not automatically inherit Cloudflare Pages vars/secrets. Configure worker-specific env/secrets where needed.

## Auth and Security Rules

Auth is dashboard-focused:

- username + password
- JWT token
- roles: `OWNER`, `MEMBER`, `GUEST`
- first registered user becomes `OWNER`
- later users become `MEMBER` if public registration is allowed
- permissions live in `shared/constants/permissions.ts`

Server-side checks are required for protected data and mutations. Client-side checks are only UI affordances.

Never:

- log passwords
- log JWTs
- leak password hashes or salts
- return secrets to GraphQL clients
- trust role/permission data sent from the browser
- expose raw internal errors for login/auth failures

Use existing auth helpers such as `requirePermission(context, 'permission:name')` when present.

Password hashing must stay Cloudflare-compatible. Do not increase PBKDF2 iterations beyond the known Worker-safe project limit without testing in the target runtime.

Use Web Crypto APIs or existing crypto helpers for secure random IDs/tokens. Never use `Math.random()` for security-sensitive values.

## Validation and Input Rules

Validate at the boundary:

- GraphQL mutation input
- REST endpoint body
- query params
- route params
- public contact form input
- email/webhook payloads

Prefer small explicit validators or existing schemas. Do not create a new validation framework.

All list inputs need bounds:

- page size max
- string length max
- array length max
- allowed enum values
- safe date range if applicable

Return practical user-safe errors. Keep detailed internal errors out of public responses.

## Inbox / Contact / Email System Rules

Current architecture:

- Website contact form writes to D1 through Nuxt/Yoga GraphQL.
- Incoming email is parsed by `workers/email` and written to D1.
- Dashboard inbox reads messages from D1.
- Replies are queued from Nuxt/Yoga; Nuxt does not send email directly.
- `workers/system` consumes queues for email delivery and admin notifications.
- PWA/Web Push notifications are handled through the system worker path.

Do not bypass this flow by adding direct SMTP/email sending inside Nuxt server resolvers.

Inbox UI should behave like a unified thread workspace:

- left thread/message list
- right detail/timeline workspace
- inbound message events
- outbound reply events when backed by data
- private note / AI draft can stay UI-local until backend supports them

## Dashboard Rules

Dashboard is an Owner Console, not a heavy admin panel.

Current target sidebar:

- Overview
- Inbox
- Leads
- Content
- Analytics
- System
- Settings

Comments and Forms are not MVP sidebar items unless explicitly reopened.

Dashboard rules:

- pages use dashboard layout and auth middleware
- dashboard data should come from GraphQL when implemented
- mock data is acceptable only for UI-first pages not yet connected
- do not add WebSockets, GraphQL subscriptions, Durable Objects, CRM/Kanban, or realtime unless explicitly requested
- keep UI minimal, readable, and Nuxt UI-compatible
- keep visible UI text localizable where practical

For dashboard summary APIs:

- prefer one compact GraphQL query for the page
- compute counts and small trends with SQL aggregates
- avoid fetching entire inbox/leads/content tables for cards
- add limits to preview lists
- consider KV snapshot cache only after the D1-backed GraphQL flow works

## Content Rules

Content is managed by Velite, not Nuxt Content.

Markdown source lives under locale folders:

```txt
content/
├── en/
│   ├── blog/
│   ├── lab/
│   ├── projects/
│   ├── about.md
│   └── contact.md
└── fa/
    ├── blog/
    ├── lab/
    ├── projects/
    ├── about.md
    └── contact.md
```

Inspect `velite.config.ts` before changing content schemas or collection patterns.

Do not do expensive markdown parsing at request time if Velite/build-time output can serve the page.

## Writing Voice (Mohetios)

Reference article: `content/en/blog/building-small-email-client-cloudflare-workers.md` — treat it as the canonical voice model for Mohetios editorial content (about, contact, blog, lab notes).

When drafting or revising user-facing prose in `content/` or aligned i18n copy, match this voice. Do not flatten it into generic SaaS marketing, resume brochure tone, or stiff technical manual prose.

### Core stance

- Write as **Mohetios** — first person, observational, honest, calm.
- Prefer **thinking out loud** over announcing credentials.
- Teach by **sequence**: warm the reader up, name the mental shift, then do the work.
- State **scope early**: what this is, what it is not, where it stops on purpose.
- Use **plain language** for ideas; use precise terms only when the reader needs them.

### Rhythm and structure

- Mix short paragraphs with **one-line beats** for contrast:

  ```txt
  Not Gmail.
  Not a helpdesk.
  Not an IMAP client.
  ```

- Open sections with a **question or observation**, not a feature list.
- Bridge sections explicitly: “That is the map.” / “Warm-up done.” / “Once that lands…”
- Use `txt` blocks for simple before/after or step order when a diagram would be heavy.
- Use tables for **practical reference** (costs, capabilities, checklist), not decoration.
- End with a **single clear idea** restated — not a hype CTA.

### Sentence habits

- Prefer: “I like…”, “For me…”, “The part I care about…”, “That changes the shape of the problem.”
- Name trade-offs and limits honestly: “This article stops earlier — on purpose.”
- Avoid filler: “leverage”, “synergy”, “cutting-edge”, “passionate about”, “world-class”.
- Avoid corporate resume stacking (“15+ years delivering innovative solutions…”).
- Contractions are fine in English when they sound natural.

### Technical editorial content

- One **mental model** per section before code or config.
- Introduce jargon once, in context; do not assume the reader lives in Cloudflare docs.
- Use real project examples (`hi@mohetios.dev`, Mohetios workers) when grounding abstractions.
- Comments in tutorial code explain **why**, not what the syntax already shows.

### Persian (`content/fa/`)

- Match the **same voice and pacing**, not a literal word-for-word translation.
- Keep first-person, calm, editorial Persian — not formal bureaucratic Farsi or marketing slogans.
- Preserve RTL-friendly structure; short lines and fragment beats work well in Persian too.
- Technical terms may stay in English when that is normal in Iranian dev writing (GraphQL, Worker, Cloudflare).

### Do not

- Rewrite the user’s natural storytelling into “professional” blandness.
- Add emoji, exclamation-heavy hype, or fake urgency.
- Invent biography, clients, or claims not supported by existing site content.
- Change factual contact links, names, or stack lists without instruction.

## Internationalization Rules

Preserve existing locale strategy.

- Keep visible UI labels localized when the surrounding page is localized.
- Preserve Persian RTL support.
- Use logical CSS properties where practical.
- Do not hardcode English text in reusable components if the project uses locale keys nearby.
- Follow existing locale file structure instead of inventing a new i18n system.

## Styling Rules

Use Nuxt UI and Tailwind CSS. **Tailwind utilities are the default styling layer for all Vue components.**

### Tailwind-first (required)

- Put layout, spacing, typography, color, borders, and responsive behavior in component `class` attributes using Tailwind utilities.
- Use Nuxt UI component `ui` props and theme tokens (`text-sm`, `text-muted`, `text-highlighted`, `border-default`, etc.) before inventing custom class names.
- Prefer logical properties (`ps-`, `pe-`, `ms-`, `me-`, `border-s`, `text-start`) for RTL-safe layouts.
- Public pages use **site shell width** — CSS classes in `app/assets/css/main.css`, constants in `shared/constants/layout.ts`:
  - `.site-shell` / `PUBLIC_SITE_SHELL_CLASS` — `72rem` + gutters (default layout, header, footer; Nuxt UI `--ui-container` matches this)
  - `.article-reading-column` / `PUBLIC_ARTICLE_READING_CLASS` — centered article column (`46rem`)
  - Prose typography uses Tailwind `@tailwindcss/typography` (`prose`); public pages pass `max-w-none` when content should use the full shell
- Do **not** put Tailwind width utilities in TS string constants; Tailwind may not scan them. Use these CSS classes.
- Do not add page-level `max-w-*` except `max-w-none` on prose and small UI widgets.
- Reuse `@theme` font tokens from `app/assets/css/main.css` when needed; prefer standard Tailwind `text-*` utilities for sizing
- Match surrounding component patterns; do not introduce parallel BEM-style class systems in Vue files.

### Allowed global CSS (`app/assets/css/main.css` only)

Keep custom CSS in `main.css` only when Tailwind cannot express it cleanly:

- `@import`, `@theme`, and design-token CSS variables (`:root`, `.dark`)
- global document resets (`html`, `body`, `#__nuxt`)
- Velite-rendered markdown prose (`.prose` and descendants; embed overrides in `prose-embeds.css`)
- third-party embed overrides that require `:deep()` or descendant selectors (Turnstile, Shiki, Mermaid inside prose)
- JS-driven effects that rely on CSS custom properties when Tailwind cannot express the runtime value

Do **not** add new component-specific class blocks to `main.css` when equivalent Tailwind utilities exist.

### Avoid in components

- `<style scoped>` blocks for layout/spacing/typography that Tailwind can handle
- duplicate utility classes in CSS that mirror Tailwind (`display: flex`, `gap`, `padding`, etc.)
- hardcoded hex colors in components when theme tokens exist
- inline `style=""` except for dynamic values set at runtime

Prefer:

- calm spacing
- minimal cards
- subtle borders
- readable typography
- restrained icons
- warm light theme
- green primary accent
- editorial/technical feel

Avoid:

- heavy enterprise dashboard UI
- noisy charts
- unnecessary gradients
- too many badges
- overusing icons
- complex layout abstractions
- generic SaaS hero sections

## Shared Folder Rules

Use `shared/` only for pure contracts used by app and server.

Allowed:

- GraphQL operation documents
- pure TypeScript types
- pure constants
- pure validation schemas
- pure contracts
- pure formatting/normalization helpers without Nuxt/Vue/server imports

Forbidden:

- Vue imports
- Nuxt composables
- Nitro/H3 imports
- Drizzle client
- D1 bindings
- JWT secret logic
- password hashing
- Cloudflare runtime access
- server resolver code

## TypeScript Rules

Prefer strict, boring TypeScript.

- Use explicit input/output types on server helpers.
- Avoid `any`; use `unknown` then narrow.
- Keep DTO mapping small and local.
- Avoid clever conditional type machinery unless it already exists.
- Do not introduce global type hacks.
- Keep generated GraphQL types as source for client operation results where practical.

## Dependencies Rules

Do not add production dependencies unless explicitly approved.

Before proposing a dependency, check:

- Can this be done with Web APIs?
- Can this be done with a 10-line helper?
- Is the library Worker-compatible?
- Does it pull Node-only transitive dependencies?
- Does it increase server bundle size for a hot route?
- Is it needed at runtime, or only at build time?

Prefer small native/Web API solutions for server hot paths.

## Commands

Preferred inspection:

```bash
rg "pattern"
rg --files
```

Targeted checks when useful:

```bash
pnpm lint
pnpm typecheck
```

Only run when explicitly requested or clearly required:

```bash
pnpm build
pnpm dev
pnpm db:generate
pnpm db:push
pnpm db:studio
wrangler deploy
wrangler pages deploy
```

Never run destructive database commands or deployment commands without explicit confirmation.

## Git Safety

- Inspect before editing.
- Preserve unrelated changes.
- Do not remove files unless directly required.
- Do not rewrite large files for style-only reasons.
- If unexpected workspace changes exist, do not overwrite them.
- If not in a git repository, make smaller edits and report that safety is reduced.

## Cursor / Codex Behavior Rules

This file is the project source of truth for coding-agent behavior.

For Codex:

- keep this file near the repository root
- avoid bloating it beyond useful project-specific instructions
- use nested `AGENTS.md` or `AGENTS.override.md` only for genuinely different subtrees such as separate workers

For Cursor:

- prefer this root `AGENTS.md` as shared guidance
- if Cursor rules are added, make them short bridges to this file or narrow path-scoped rules
- do not duplicate the full project guide across many `.mdc` files

When working as an agent:

- follow project patterns over generic framework advice
- do not create files just because a template suggests them
- do not add docs unless requested
- do not add tests unless the project already has a clear test pattern or the task asks for them
- do not “improve” unrelated code
- do not replace working compact code with enterprise architecture

## Server Code Review Checklist

Before finalizing a server/backend change, verify:

- Does this run on Cloudflare/Nitro without Node-only runtime assumptions?
- Are env and bindings read through the existing project pattern?
- Are all promises awaited, returned, queued, or passed to approved waitUntil?
- Is request-scoped state local, not global?
- Are queries bounded and indexed where needed?
- Are list responses paginated or limited?
- Are only required columns selected?
- Are permissions checked server-side?
- Are inputs validated and bounded?
- Are errors user-safe?
- Are secrets/tokens/passwords never logged?
- Did this avoid unnecessary dependencies and abstraction layers?

## Default Answer Format for Implementation Tasks

When asked to give AI editor/Codex instructions, provide a complete implementable brief with:

- objective
- target files
- constraints
- generated base code or exact patch guidance when practical
- adaptation notes
- acceptance criteria
- what not to change
- checks to run

The brief should be complete enough that the editor agent can implement without guessing.
