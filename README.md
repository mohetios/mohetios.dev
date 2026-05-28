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

The build script sets `NODE_OPTIONS=--max-old-space-size=4096` because Nuxt Content plus prerendering can exceed the default Node heap on Cloudflare Pages.

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
