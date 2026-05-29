# Deployment

Mohetios.dev deploys to Cloudflare Pages with Nuxt SSR output.

## Cloudflare Pages Settings

- Build command: `pnpm build`
- Build output directory: `dist`
- Deploy command: leave empty, or use `npx wrangler pages deploy dist`
- Local development with bindings: `pnpm dev`
- Local preview after build: `pnpm preview`

Do not use `npx wrangler deploy`. That command deploys a Workers project, not a Pages project, and will fail because this Nuxt build emits Cloudflare Pages output.

`pnpm build:pages` is available as an explicit Cloudflare Pages build alias. `pnpm deploy` and `pnpm deploy:pages` both upload `dist` with Wrangler Pages.

## Runtime Bindings

Nuxt Content uses Cloudflare D1 in production.

- Binding: `DB`
- Database name: `mohetios-dev-content`
- Database ID: `3ad937ef-5dfd-4040-bb81-30358caabc92`

The same binding is declared in `wrangler.jsonc`.

For deployed production and preview environments, configure the `DB` binding in the Cloudflare Pages dashboard. `wrangler.jsonc` is used by local development tooling, and dashboard bindings are still required for remote Pages deployments.

Server routes can access Cloudflare bindings through `event.context.cloudflare.env`. The current typed binding surface is declared in `env.d.ts`.

## Config Notes

- `wrangler.jsonc` uses `compatibility_flags: ["nodejs_compat"]` for Nuxt/Nitro compatibility on Cloudflare.
- `nitro-cloudflare-dev` is enabled so `nuxt dev` can emulate bindings from `wrangler.jsonc`.
- Nuxt Content is configured to use D1 with binding name `DB`.
- Vite dependency pre-optimization is intentionally cleared because Nuxt Content/MDC can inject unresolvable dev optimize entries.
- Run `pnpm types:cloudflare` after adding new Cloudflare bindings or changing `wrangler.jsonc`.
