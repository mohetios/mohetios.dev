import { getPrerenderContentRoutes } from './app/utils/content'

const siteUrl = 'https://mohetios.dev'
const htmlCacheHeaders = {
  'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
}
const immutableAssetHeaders = {
  'Cache-Control': 'public, max-age=31536000, immutable'
}

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
  modules: [
    '@nuxt/eslint',
    '@nuxtjs/i18n',
    '@nuxt/ui',
    'nuxt-charts',
    '@nuxt/image',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots',
    'nitro-cloudflare-dev',
    'nuxt-graphql-client'
  ],

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
        { property: 'og:url', content: siteUrl },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'theme-color', content: '#FCFBF8', media: '(prefers-color-scheme: light)' },
        { name: 'theme-color', content: '#0F1823', media: '(prefers-color-scheme: dark)' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/icons/favicon-16x16.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/icons/favicon-32x32.png' },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '192x192',
          href: '/icons/android-chrome-192x192.png'
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '512x512',
          href: '/icons/android-chrome-512x512.png'
        },
        { rel: 'apple-touch-icon', href: '/icons/apple-touch-icon.png' }
      ]
    }
  },

  css: ['~/assets/css/main.css'],

  site: {
    url: siteUrl,
    name: 'Mohetios.dev'
  },

  runtimeConfig: {
    public: {
      'graphql-client': {
        clients: {
          default: {
            host: '/graph'
          }
        },
        documentPaths: ['../shared/graphql'],
        codegen: false
      }
    }
  },

  routeRules: {
    '/': { prerender: true },
    '/fa': { prerender: true, headers: htmlCacheHeaders },
    '/en': { prerender: true, headers: htmlCacheHeaders },
    '/fa/blog/**': { prerender: true, headers: htmlCacheHeaders },
    '/en/blog/**': { prerender: true, headers: htmlCacheHeaders },
    '/fa/lab/**': { prerender: true, headers: htmlCacheHeaders },
    '/en/lab/**': { prerender: true, headers: htmlCacheHeaders },
    '/fa/projects/**': { prerender: true, headers: htmlCacheHeaders },
    '/en/projects/**': { prerender: true, headers: htmlCacheHeaders },
    '/fa/tags/**': { prerender: true, headers: htmlCacheHeaders },
    '/en/tags/**': { prerender: true, headers: htmlCacheHeaders },
    '/fa/about': { prerender: true, headers: htmlCacheHeaders },
    '/en/about': { prerender: true, headers: htmlCacheHeaders },
    '/_nuxt/**': {
      headers: {
        ...immutableAssetHeaders,
        'X-Robots-Tag': 'noindex'
      }
    },
    '/content/**': {
      headers: immutableAssetHeaders
    },
    '/icons/**': {
      headers: immutableAssetHeaders
    },
    '/patterns/**': {
      headers: immutableAssetHeaders
    },
    '/*.woff': {
      headers: immutableAssetHeaders
    },
    '/*.woff2': {
      headers: immutableAssetHeaders
    },
    '/*.webp': {
      headers: immutableAssetHeaders
    },
    '/*.png': {
      headers: immutableAssetHeaders
    },
    '/*.jpg': {
      headers: immutableAssetHeaders
    },
    '/*.jpeg': {
      headers: immutableAssetHeaders
    },
    '/*.svg': {
      headers: immutableAssetHeaders
    },
    '/*.ico': {
      headers: immutableAssetHeaders
    }
  },

  sourcemap: {
    server: false,
    client: false
  },

  experimental: {
    emitRouteChunkError: 'automatic-immediate'
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
      crawlLinks: false,
      routes: [...getContentRoutes(), '/robots.txt', '/sitemap.xml']
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
    provider: process.env.NODE_ENV === 'production' ? 'cloudflare' : 'none',
    quality: 70,
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280
    },
    cloudflare: {
      baseURL: process.env.NUXT_BASE_URL || siteUrl
    }
  },

  robots: {
    sitemap: ['/sitemap.xml'],
    cacheControl: 'max-age=14400, must-revalidate',
    credits: false
  },

  sitemap: {
    urls: () => getContentRoutes(),
    autoLastmod: true,
    discoverImages: true,
    discoverVideos: false,
    minify: true,
    cacheMaxAgeSeconds: 3600,
    credits: false
  },
})
