import { getPrerenderContentRoutes } from './app/utils/content'

const siteUrl = 'https://mohetios.dev'
const htmlCacheHeaders = {
  'Cache-Control': 'public, max-age=0, must-revalidate'
}
const immutableAssetHeaders = {
  'Cache-Control': 'public, max-age=31536000, immutable'
}
const turnstileSiteKey = process.env.NUXT_PUBLIC_TURNSTILE_SITE_KEY || ''

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
  '/fa/about',
  '/en/contact',
  '/fa/contact'
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
    '@nuxtjs/turnstile',
    'nuxt-graphql-client',
    '@vite-pwa/nuxt'
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
    jwtSecret: process.env.NUXT_JWT_SECRET || '',
    authTokenTtlSeconds: process.env.NUXT_AUTH_TOKEN_TTL_SECONDS || '604800',
    allowPublicRegister: process.env.NUXT_ALLOW_PUBLIC_REGISTER || 'false',
    mailFrom: process.env.NUXT_MAIL_FROM || 'hi@mohetios.dev',
    mailFromName: process.env.NUXT_MAIL_FROM_NAME || 'Mohetios.dev',
    vapidPublicKey: process.env.NUXT_VAPID_PUBLIC_KEY || '',
    vapidPrivateKey: process.env.NUXT_VAPID_PRIVATE_KEY || '',
    vapidSubject: process.env.NUXT_VAPID_SUBJECT || 'mailto:hi@mohetios.dev',
    turnstile: {
      secretKey: process.env.NUXT_TURNSTILE_SECRET_KEY || ''
    },
    public: {
      turnstile: {
        siteKey: turnstileSiteKey
      },
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
    '/fa/contact': { prerender: true, headers: htmlCacheHeaders },
    '/en/contact': { prerender: true, headers: htmlCacheHeaders },
    '/dashboard': { ssr: true, prerender: false },
    '/dashboard/**': { ssr: true, prerender: false },
    '/fa/dashboard': { ssr: true, prerender: false },
    '/en/dashboard': { ssr: true, prerender: false },
    '/fa/dashboard/**': { ssr: true, prerender: false },
    '/en/dashboard/**': { ssr: true, prerender: false },
    '/member/**': { ssr: true, prerender: false },
    '/fa/member/**': { ssr: true, prerender: false },
    '/en/member/**': { ssr: true, prerender: false },
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

  pwa: {
    strategies: 'injectManifest',
    srcDir: './',
    filename: 'sw.ts',
    manifest: {
      name: 'Mohetios.dev',
      short_name: 'Mohetios',
      display: 'standalone',
      start_url: '/dashboard',
      scope: '/',
      icons: [
        {
          src: '/icons/icon-192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/icons/icon-512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    },
    injectManifest: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico,webp,woff,woff2}']
    },
    registerType: 'autoUpdate'
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

  turnstile: {
    siteKey: turnstileSiteKey
  },
})
