import { getPrerenderContentRoutes } from './app/utils/content'

const staticRoutes = [
  '/',
  '/en',
  '/fa',
  '/en/blog',
  '/fa/blog',
  '/en/lab',
  '/fa/lab',
  '/en/projects',
  '/fa/projects',
  '/en/about',
  '/fa/about'
]

function getContentRoutes() {
  const routes = new Set([...staticRoutes, ...getPrerenderContentRoutes()])

  return [...routes].sort()
}

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxtjs/i18n', '@nuxt/ui', '@nuxt/image', 'nitro-cloudflare-dev'],

  devtools: {
    enabled: true
  },

  app: {
    head: {
      titleTemplate: '%s',
      meta: [
        {
          name: 'description',
          content:
            'A personal engineering lab for software, product thinking, open-source experiments, and long-form technical notes.'
        },
        { property: 'og:site_name', content: 'Mohetios.dev' },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://mohetios.dev' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'theme-color', content: '#ffffff', media: '(prefers-color-scheme: light)' },
        { name: 'theme-color', content: '#020617', media: '(prefers-color-scheme: dark)' }
      ],
      link: [
        { rel: 'icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/icons/favicon-16x16.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/icons/favicon-32x32.png' },
        { rel: 'apple-touch-icon', href: '/icons/apple-touch-icon.png' }
      ]
    }
  },

  css: ['~/assets/css/main.css'],

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
    '/en/about': { prerender: true },
    '/_nuxt/**': {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    },
    '/content/**': {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    },
    '/icons/**': {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    },
    '/*.woff': {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    },
    '/*.woff2': {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    }
  },

  sourcemap: {
    server: false,
    client: false
  },

  compatibilityDate: '2026-05-28',

  nitro: {
    preset: 'cloudflare_pages',
    compressPublicAssets: { brotli: true, gzip: true },
    minify: true,
    sourceMap: false,
    timing: false,
    prerender: {
      autoSubfolderIndex: false,
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
        code: 'en',
        name: 'English',
        file: 'en.json',
        dir: 'ltr',
        language: 'en-US'
      },
      {
        code: 'fa',
        name: 'فارسی',
        file: 'fa.json',
        dir: 'rtl',
        language: 'fa-IR'
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
  }
})
