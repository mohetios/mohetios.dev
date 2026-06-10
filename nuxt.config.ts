import {
  defaultLocale,
  getLocalizedPublicPath,
  getPrerenderContentRoutes,
  supportedLocales
} from './app/utils/content'
import {
  API_GRAPH_RATE_LIMITER,
  CLOUDFLARE_CSP_ORIGINS,
  REQUEST_SIZE_LIMIT_BYTES
} from './shared/constants/security'

const isDev = process.env.NODE_ENV !== 'production'
const isProduction = process.env.NODE_ENV === 'production'

const graphApiRateLimiter = {
  ...API_GRAPH_RATE_LIMITER,
  ...(isProduction ? { ipHeader: 'CF-Connecting-IP' as const } : {})
}

const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || 'https://mohetios.dev'

const htmlCacheHeaders = {
  'Cache-Control': 'public, max-age=0, must-revalidate'
}

const immutableAssetHeaders = {
  'Cache-Control': 'public, max-age=31536000, immutable'
}

const turnstileSiteKey = process.env.NUXT_PUBLIC_TURNSTILE_SITE_KEY || ''

const staticRouteSections = ['/', '/blog', '/lab', '/projects', '/about', '/contact']
const authRouteSections = ['/login']
const authRedirectSections = ['/register', '/reset-password']
const contentRoutePatterns = ['/blog/**', '/lab/**', '/projects/**', '/tags/**']
const memberRoutePatterns = ['/member/**']

const staticRoutes = supportedLocales.flatMap((locale) =>
  staticRouteSections.map((section) => getLocalizedPublicPath(section, locale))
)

const localizedHtmlRouteRules = Object.fromEntries(
  [
    ...staticRoutes,
    ...supportedLocales.flatMap((locale) =>
      contentRoutePatterns.map((pattern) => getLocalizedPublicPath(pattern, locale))
    )
  ].map((route) => [route, { prerender: true, headers: htmlCacheHeaders }])
)

const localizedSsrRouteRules = Object.fromEntries(
  supportedLocales
    .flatMap((locale) =>
      memberRoutePatterns.map((pattern) => getLocalizedPublicPath(pattern, locale))
    )
    .map((route) => [route, { ssr: true, prerender: false }])
)

const localizedClientAuthRouteRules = Object.fromEntries(
  supportedLocales
    .flatMap((locale) =>
      authRouteSections.map((section) => getLocalizedPublicPath(section, locale))
    )
    .map((route) => [route, { ssr: false, prerender: false }])
)

const localizedAuthRedirectRouteRules = Object.fromEntries(
  supportedLocales.flatMap((locale) =>
    authRedirectSections.map((section) => [
      getLocalizedPublicPath(section, locale),
      { redirect: getLocalizedPublicPath('/login', locale) }
    ])
  )
)

function getContentRoutes() {
  const routes = new Set([...staticRoutes, ...getPrerenderContentRoutes()])

  return [...routes].sort()
}

const prerenderRoutes = [...getContentRoutes(), '/robots.txt', '/sitemap.xml']

const contentSecurityPolicy = {
  'default-src': ["'self'"],
  'base-uri': ["'self'"],
  'font-src': ["'self'", 'data:'],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'img-src': ["'self'", 'data:', 'blob:', 'https:'],
  'object-src': ["'none'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'",
    CLOUDFLARE_CSP_ORIGINS.turnstile,
    CLOUDFLARE_CSP_ORIGINS.webAnalyticsScript,
    ...(isDev ? ["'unsafe-eval'"] : [])
  ],
  'script-src-attr': ["'none'"],
  'style-src': ["'self'", "'unsafe-inline'"],
  'connect-src': [
    "'self'",
    CLOUDFLARE_CSP_ORIGINS.turnstile,
    CLOUDFLARE_CSP_ORIGINS.webAnalyticsConnect,
    ...(isDev ? ['ws:', 'wss:'] : [])
  ],
  'frame-src': [CLOUDFLARE_CSP_ORIGINS.turnstile],
  'worker-src': ["'self'", 'blob:'],
  'manifest-src': ["'self'"],
  // Turnstile challenge iframes set their own trusted-types policy; keep ours off.
  'trusted-types': false as const,
  'require-trusted-types-for': false as const
}

export default defineNuxtConfig({
  components: {
    dirs: [
      {
        path: '~/components',
        pathPrefix: true
      }
    ]
  },

  modules: [
    ...(isDev ? ['@nuxt/eslint', 'nitro-cloudflare-dev'] : []),
    '@nuxtjs/i18n',
    '@nuxt/ui',
    'nuxt-charts',
    '@nuxt/image',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots',
    '@nuxtjs/turnstile',
    'nuxt-graphql-client',
    '@vite-pwa/nuxt',
    'nuxt-security',
    '@stefanobartoletti/nuxt-social-share',
    'nuxt-og-image'
  ],

  devtools: {
    enabled: isDev
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
        { rel: 'manifest', href: '/manifest.webmanifest' },
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

  vite: {
    optimizeDeps: {
      include: ['mermaid', 'zod']
    },
    build: {
      sourcemap: false,
      // Mermaid lazy-loads as a ~2 MB async chunk on content pages with diagrams only.
      chunkSizeWarningLimit: 2048,
      rollupOptions: {
        onwarn(warning, warn) {
          // Tailwind/Nuxt CSS transforms don't emit sourcemaps; harmless when maps are off.
          if (warning.code === 'SOURCEMAP_BROKEN') {
            return
          }

          warn(warning)
        }
      }
    }
  },

  site: {
    url: siteUrl,
    name: 'Mohetios.dev'
  },

  runtimeConfig: {
    jwtSecret: process.env.NUXT_JWT_SECRET || '',
    authTokenTtlSeconds: process.env.NUXT_AUTH_TOKEN_TTL_SECONDS || '604800',
    mailFrom: process.env.NUXT_MAIL_FROM || 'hi@mohetios.dev',
    mailFromName: process.env.NUXT_MAIL_FROM_NAME || 'Mohetios.dev',
    vapidPublicKey: process.env.NUXT_VAPID_PUBLIC_KEY || '',
    vapidPrivateKey: process.env.NUXT_VAPID_PRIVATE_KEY || '',
    vapidSubject: process.env.NUXT_VAPID_SUBJECT || 'mailto:hi@mohetios.dev',
    turnstile: {
      secretKey: process.env.NUXT_TURNSTILE_SECRET_KEY || ''
    },
    cloudflareAnalyticsToken: process.env.NUXT_CLOUDFLARE_ANALYTICS_TOKEN || '',
    cloudflareAccountId: process.env.NUXT_CLOUDFLARE_ACCOUNT_ID || '',
    cloudflareZoneId: process.env.NUXT_CLOUDFLARE_ZONE_ID || '',
    cloudflareHostname: process.env.NUXT_CLOUDFLARE_HOSTNAME || 'mohetios.dev',
    enableRealAnalytics: process.env.NUXT_ENABLE_REAL_ANALYTICS || 'false',
    public: {
      siteUrl,
      turnstile: {
        siteKey: turnstileSiteKey
      },
      'graphql-client': {
        clients: {
          default: {
            host: '/graph',
            schema: '../schema.graphql',
            token: {
              type: 'Bearer',
              name: 'Authorization'
            },
            tokenStorage: {
              name: 'mohetios_auth_token',
              mode: 'cookie',
              cookieOptions: {
                path: '/',
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24 * 7
              }
            },
            proxyCookies: true
          }
        },
        documentPaths: ['../shared/graphql'],
        codegen: {
          silent: true,
          useTypeImports: true,
          enumsAsTypes: true,
          onlyOperationTypes: true,
          maybeValue: 'T | null'
        }
      }
    }
  },

  security: {
    nonce: false,
    // Host allowlists work better than SRI hashes for Turnstile + @nuxt/scripts on prerendered pages.
    sri: false,
    ssg: {
      meta: true,
      hashScripts: false,
      hashStyles: false,
      nitroHeaders: true,
      exportToPresets: true
    },
    headers: {
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: 'unsafe-none',
      crossOriginResourcePolicy: 'same-site',
      contentSecurityPolicy,
      referrerPolicy: 'strict-origin-when-cross-origin',
      xFrameOptions: 'DENY',
      xContentTypeOptions: 'nosniff',
      permissionsPolicy: {
        camera: [],
        microphone: [],
        geolocation: [],
        payment: [],
        usb: [],
        fullscreen: ['self']
      }
    },
    requestSizeLimiter: {
      maxRequestSizeInBytes: REQUEST_SIZE_LIMIT_BYTES
    },
    rateLimiter: false,
    corsHandler: false,
    csrf: false,
    xssValidator: false,
    allowedMethodsRestricter: {
      methods: ['GET', 'HEAD', 'POST', 'OPTIONS']
    },
    hidePoweredBy: true
  },

  routeRules: {
    ...localizedHtmlRouteRules,
    ...localizedClientAuthRouteRules,
    ...localizedAuthRedirectRouteRules,

    '/dashboard': {
      ssr: true,
      prerender: false,
      security: {
        headers: {
          xFrameOptions: 'DENY'
        }
      }
    },
    '/dashboard/**': {
      ssr: true,
      prerender: false,
      security: {
        headers: {
          xFrameOptions: 'DENY'
        }
      }
    },

    '/graph': {
      security: {
        rateLimiter: graphApiRateLimiter,
        requestSizeLimiter: {
          maxRequestSizeInBytes: REQUEST_SIZE_LIMIT_BYTES
        }
      }
    },

    '/api/**': {
      security: {
        rateLimiter: graphApiRateLimiter
      }
    },

    ...localizedSsrRouteRules,

    '/content/**': { headers: immutableAssetHeaders },
    '/icons/**': { headers: immutableAssetHeaders },
    '/patterns/**': { headers: immutableAssetHeaders },

    '/_nuxt/**': { headers: immutableAssetHeaders },

    '/*.woff': { headers: immutableAssetHeaders },
    '/*.woff2': { headers: immutableAssetHeaders },
    '/*.webp': { headers: immutableAssetHeaders },
    '/*.png': { headers: immutableAssetHeaders },
    '/*.jpg': { headers: immutableAssetHeaders },
    '/*.jpeg': { headers: immutableAssetHeaders },
    '/*.svg': { headers: immutableAssetHeaders },
    '/*.ico': { headers: immutableAssetHeaders }
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
    ...(isProduction
      ? {
          storage: {
            cache: {
              driver: 'cloudflare-kv-binding',
              binding: 'ANALYTICS_CACHE',
              base: 'nitro-cache'
            }
          }
        }
      : {}),
    compressPublicAssets: {
      brotli: true,
      gzip: true
    },
    minify: isProduction,
    sourceMap: false,
    timing: false,
    prerender: {
      autoSubfolderIndex: false,
      concurrency: 4,
      crawlLinks: false,
      routes: prerenderRoutes
    }
  },

  i18n: {
    langDir: 'locales',
    defaultLocale,
    strategy: 'prefix_except_default',
    detectBrowserLanguage: false,
    locales: [
      {
        code: supportedLocales[0],
        name: 'English',
        file: 'en.json',
        dir: 'ltr',
        language: 'en-US'
      },
      {
        code: supportedLocales[1],
        name: 'فارسی',
        file: 'fa.json',
        dir: 'rtl',
        language: 'fa-IR'
      }
    ]
  },

  image: {
    provider: isProduction ? 'cloudflare' : 'none',
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
    srcDir: '.',
    filename: 'sw.ts',
    registerType: 'autoUpdate',
    injectRegister: 'script',

    manifest: {
      id: '/dashboard',
      name: 'Mohetios.dev Dashboard',
      short_name: 'Mohetios',
      description: 'Owner console for Mohetios.dev inbox, leads, analytics, and system signals.',
      display: 'standalone',
      display_override: ['window-controls-overlay', 'standalone'],
      start_url: '/dashboard',
      scope: '/',
      theme_color: '#FCFBF8',
      background_color: '#FCFBF8',
      categories: ['productivity', 'business'],
      orientation: 'portrait-primary',
      icons: [
        {
          src: '/icons/android-chrome-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/icons/android-chrome-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        },
        {
          src: '/icons/android-chrome-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable'
        }
      ],
      shortcuts: [
        {
          name: 'Inbox',
          short_name: 'Inbox',
          description: 'Open the dashboard inbox.',
          url: '/dashboard/inbox',
          icons: [
            {
              src: '/icons/android-chrome-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            }
          ]
        },
        {
          name: 'Leads',
          short_name: 'Leads',
          description: 'Review dashboard leads.',
          url: '/dashboard/leads',
          icons: [
            {
              src: '/icons/android-chrome-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            }
          ]
        }
      ]
    },

    injectManifest: {
      injectionPoint: undefined,
      rollupFormat: 'es'
    },

    devOptions: {
      enabled: true,
      type: 'module'
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
    discoverImages: false,
    discoverVideos: false,
    minify: true,
    cacheMaxAgeSeconds: 3600,
    credits: false
  },

  turnstile: {
    siteKey: turnstileSiteKey
  },

  socialShare: {
    baseUrl: siteUrl
  },

  ogImage: {
    zeroRuntime: true
  }
})
