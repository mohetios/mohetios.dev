import { readdirSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

const staticRoutes = [
  '/',
  '/fa',
  '/en',
  '/fa/blog',
  '/en/blog',
  '/fa/lab',
  '/en/lab',
  '/fa/projects',
  '/en/projects',
  '/fa/about',
  '/en/about'
]

function getContentRoutes() {
  const contentDir = join(process.cwd(), 'content')
  const routes = new Set(staticRoutes)

  function walk(dir: string) {
    for (const entry of readdirSync(dir)) {
      const fullPath = join(dir, entry)

      if (statSync(fullPath).isDirectory()) {
        walk(fullPath)
        continue
      }

      if (!entry.endsWith('.md')) {
        continue
      }

      const segments = relative(contentDir, fullPath)
        .split(sep)
        .map((segment) => segment.replace(/\.md$/, ''))
        .filter((segment) => segment !== 'index')
        .map((segment) => segment.toLowerCase())

      routes.add(`/${segments.join('/')}`)
    }
  }

  walk(contentDir)

  return [...routes].sort()
}

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxtjs/i18n', '@nuxt/ui', '@nuxt/content', '@nuxt/image'],

  devtools: {
    enabled: true
  },

  app: {
    head: {
      titleTemplate: '%s - Mohetios.dev',
      meta: [
        {
          name: 'description',
          content:
            'A personal engineering lab for software, product thinking, open-source experiments, and long-form technical notes.'
        },
        { property: 'og:site_name', content: 'Mohetios.dev' },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://mohetios.dev' },
        { name: 'twitter:card', content: 'summary_large_image' }
      ],
      link: [
        { rel: 'canonical', href: 'https://mohetios.dev' },
        { rel: 'icon', href: '/favicon.ico' }
      ]
    }
  },

  css: ['~/assets/css/main.css'],

  content: {
    database: {
      type: 'd1',
      bindingName: 'DB'
    }
  },

  routeRules: {
    '/': { prerender: true },
    '/fa': { prerender: true },
    '/en': { prerender: true },
    '/fa/blog/**': { prerender: true },
    '/en/blog/**': { prerender: true },
    '/fa/lab/**': { prerender: true },
    '/en/lab/**': { prerender: true },
    '/fa/projects/**': { prerender: true },
    '/en/projects/**': { prerender: true },
    '/fa/about': { prerender: true },
    '/en/about': { prerender: true }
  },

  compatibilityDate: '2026-05-28',

  nitro: {
    preset: 'cloudflare_pages',
    prerender: {
      concurrency: 1,
      crawlLinks: true,
      routes: getContentRoutes()
    }
  },

  vite: {
    optimizeDeps: {
      include: []
    }
  },

  hooks: {
    'vite:extendConfig'(config) {
      const optimizeDeps = config.optimizeDeps as { include?: string[] } | undefined

      if (optimizeDeps) {
        optimizeDeps.include = []
      }
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  i18n: {
    langDir: 'locales',
    defaultLocale: 'en',
    strategy: 'prefix',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'mohetios_locale',
      redirectOn: 'root'
    },
    locales: [
      {
        code: 'fa',
        name: 'فارسی',
        file: 'fa.json',
        dir: 'rtl',
        language: 'fa-IR'
      },
      {
        code: 'en',
        name: 'English',
        file: 'en.json',
        dir: 'ltr',
        language: 'en-US'
      }
    ]
  },

  image: {
    provider: 'none',
    quality: 80,
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280
    }
  },
})
