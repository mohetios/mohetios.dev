# Deployment

Mohetios.dev deploys to Cloudflare Pages with Nuxt SSR output.

## Cloudflare Pages Settings

- Build command: `pnpm build`
- Build output directory: `dist`
- Deploy command: leave empty, or use `npx wrangler pages deploy dist`

Do not use `npx wrangler deploy`. That command deploys a Workers project, not a Pages project, and will fail because this Nuxt build emits Cloudflare Pages output.

## Runtime Bindings

Nuxt Content uses Cloudflare D1 in production.

- Binding: `DB`
- Database name: `mohetios-dev-content`
- Database ID: `3ad937ef-5dfd-4040-bb81-30358caabc92`

The same binding is declared in `wrangler.jsonc`.
