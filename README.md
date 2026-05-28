# Mohetios.dev

Personal technical blog and portfolio for Mohetios.

Built with Nuxt, Nuxt Content v3, Nuxt UI, and Tailwind CSS through Nuxt UI. Deployment target is Cloudflare Pages.

## Development

Install dependencies:

```bash
pnpm install
```

Start the dev server:

```bash
pnpm dev
```

Build for Cloudflare Pages SSR:

```bash
pnpm build
```

Preview a production build:

```bash
pnpm preview
```

Deploy with Wrangler direct upload:

```bash
pnpm deploy:pages
```

Use Cloudflare Pages deploys for this project, not `wrangler deploy`.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for Cloudflare Pages and D1 binding notes.
