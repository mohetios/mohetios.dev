import blogJson from '../../.velite/blog.json'
import labJson from '../../.velite/lab.json'
import pagesJson from '../../.velite/pages.json'
import projectsJson from '../../.velite/projects.json'

export type TocItem = {
  title: string
  url: string
  items?: TocItem[]
}

/** Velite often nests all headings under a single h1 root — unwrap for nav display. */
export function getTocNavLinks(items: TocItem[] = []) {
  if (items.length === 1 && items[0]?.items?.length) {
    return items[0].items
  }

  return items
}

export function shouldShowToc(items: TocItem[] = []) {
  return getTocNavLinks(items).length > 0
}

type BaseContent = {
  id: string
  title: string
  description?: string
  updated?: string
  thumbnail?: string
  draft?: boolean
  path: string
  content: string
  raw: string
  tocData: TocItem[]
}

export type BlogPost = BaseContent & {
  description: string
  date: string
  status?: string
  tags: string[]
  author?: string
  category?: string
  readingTime?: string
  thumbnailAlt?: string
  thumbnailCredit?: string
  series?: string
  summary?: string[]
}

export type LabNote = BlogPost

export type Project = BlogPost & {
  status: string
  repo?: string
  website?: string
  featured: boolean
}

export type Page = BaseContent
export type ContentItem = BlogPost | LabNote | Project | Page
export type TaggedContentType = 'blog' | 'lab' | 'project'

export type TaggedContentItem = {
  id: string
  type: TaggedContentType
  title: string
  description?: string
  path: string
  date?: string
  updated?: string
  tags: string[]
  tagSlugs: string[]
  thumbnail?: string
  status?: string
}

const blog = blogJson as BlogPost[]
const lab = labJson as LabNote[]
const projects = projectsJson as Project[]
const pages = pagesJson as Page[]
export const defaultLocale = 'en'
export const supportedLocales = ['en', 'fa'] as const

const publicSections = ['/', '/blog', '/lab', '/projects', '/about', '/contact']
const staticPublicPaths = new Set(
  supportedLocales.flatMap((locale) =>
    publicSections.map((section) => getLocalizedPublicPath(section, locale))
  )
)

function byDateDesc<T extends { date?: string }>(items: T[]) {
  return [...items].sort(
    (a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
  )
}

function visible<T extends { draft?: boolean }>(items: T[]) {
  return items.filter((item) => item.draft !== true)
}

function normalizeRoutePath(path: string) {
  if (!path || path === '/') {
    return '/'
  }

  return `/${path.replace(/^\/+|\/+$/g, '')}`.toLowerCase()
}

export function stripLocalePrefix(path: string) {
  const normalized = normalizeRoutePath(path)
  const localePattern = supportedLocales.join('|')

  return normalized.replace(new RegExp(`^\\/(${localePattern})(?=\\/|$)`), '') || '/'
}

export function getRouteLocale(path: string) {
  const normalized = normalizeRoutePath(path)
  const localePattern = supportedLocales.join('|')
  const match = normalized.match(new RegExp(`^\\/(${localePattern})(?=\\/|$)`))

  return match?.[1] || defaultLocale
}

export function toPublicPath(path: string) {
  const normalized = normalizeRoutePath(path)

  if (normalized === `/${defaultLocale}`) {
    return '/'
  }

  if (normalized.startsWith(`/${defaultLocale}/`)) {
    return normalized.slice(defaultLocale.length + 1) || '/'
  }

  return normalized
}

export function toContentPath(path: string, locale = getRouteLocale(path)) {
  const normalized = normalizeRoutePath(path)

  if (normalized.startsWith(`/${locale}/`) || normalized === `/${locale}`) {
    return normalized
  }

  return normalizeRoutePath(`/${locale}${normalized === '/' ? '' : normalized}`)
}

export function getLocalizedPublicPath(path: string, locale: string) {
  const suffix = stripLocalePrefix(toPublicPath(path))

  if (locale === defaultLocale) {
    return suffix
  }

  return normalizeRoutePath(`/${locale}${suffix === '/' ? '' : suffix}`)
}

function localizedContentPaths() {
  return new Set(
    [...visible(blog), ...visible(lab), ...visible(projects), ...visible(pages)].map((item) =>
      normalizeRoutePath(item.path)
    )
  )
}

export function routeExists(path: string) {
  const publicPath = toPublicPath(path)
  const contentPath = toContentPath(publicPath, getRouteLocale(publicPath))

  return staticPublicPaths.has(publicPath) || localizedContentPaths().has(contentPath)
}

export function getLocalizedRoutePath(
  path: string,
  targetLocale: string,
  options: { fallbackToSection?: boolean } = {}
) {
  const suffix = stripLocalePrefix(toPublicPath(path))
  const localizedPath = getLocalizedPublicPath(suffix, targetLocale)

  if (routeExists(localizedPath)) {
    return localizedPath
  }

  if (!options.fallbackToSection) {
    return undefined
  }

  const section = suffix.match(/^\/(blog|lab|projects)(?=\/|$)/)?.[1]

  if (section) {
    return `/${targetLocale}/${section}`
  }

  return targetLocale === defaultLocale ? '/' : `/${targetLocale}`
}

export const normalizeTagSlug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
    .replace(/^-+|-+$/g, '')

export function getTagLabel(tag: string) {
  const value = tag.trim()

  if (!value.includes('-')) {
    return value
  }

  return value
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function byActivityDesc<T extends { date?: string; updated?: string }>(items: T[]) {
  return [...items].sort((a, b) => {
    const aDate = a.updated || a.date || 0
    const bDate = b.updated || b.date || 0

    return new Date(bDate).getTime() - new Date(aDate).getTime()
  })
}

function toTaggedContentItem(
  item: BlogPost | LabNote | Project,
  type: TaggedContentType
): TaggedContentItem {
  const tags = item.tags || []

  return {
    id: item.id,
    type,
    title: item.title,
    description: item.description,
    path: item.path,
    date: item.date,
    updated: item.updated,
    tags,
    tagSlugs: tags.map((tag) => normalizeTagSlug(tag)).filter(Boolean),
    thumbnail: item.thumbnail,
    status: item.status
  }
}

export function getBlogPosts(locale: string, limit?: number) {
  const items = visible(blog.filter((post) => post.path.startsWith(`/${locale}/blog/`)))
  const sorted = byDateDesc(items)

  return typeof limit === 'number' ? sorted.slice(0, limit) : sorted
}

export function getBlogPost(path: string) {
  return blog.find((post) => post.path === path.toLowerCase())
}

export function getLabNotes(locale: string, limit?: number) {
  const items = visible(lab.filter((note) => note.path.startsWith(`/${locale}/lab/`)))
  const sorted = byDateDesc(items)

  return typeof limit === 'number' ? sorted.slice(0, limit) : sorted
}

export function getLabNote(path: string) {
  return lab.find((note) => note.path === path.toLowerCase())
}

export function getProjects(locale: string, limit?: number) {
  const items = visible(
    projects.filter((project) => project.path.startsWith(`/${locale}/projects/`))
  )
  const sorted = byDateDesc(items)

  return typeof limit === 'number' ? sorted.slice(0, limit) : sorted
}

export function getTaggedContent(locale: string) {
  return byActivityDesc([
    ...visible(blog)
      .filter((post) => post.path.startsWith(`/${locale}/blog/`))
      .map((post) => toTaggedContentItem(post, 'blog')),
    ...visible(lab)
      .filter((note) => note.path.startsWith(`/${locale}/lab/`))
      .map((note) => toTaggedContentItem(note, 'lab')),
    ...visible(projects)
      .filter((project) => project.path.startsWith(`/${locale}/projects/`))
      .map((project) => toTaggedContentItem(project, 'project'))
  ])
}

export function getTagRoutes(locales: readonly string[] = supportedLocales) {
  return locales.flatMap((locale) => {
    const tagSlugs = new Set(
      getTaggedContent(locale).flatMap((item) => item.tags.map((tag) => normalizeTagSlug(tag)))
    )

    return [...tagSlugs]
      .filter(Boolean)
      .map((tagSlug) => getLocalizedPublicPath(`/tags/${tagSlug}`, locale))
  })
}

export function getPrerenderContentRoutes(locales: readonly string[] = supportedLocales) {
  return [
    ...locales
      .flatMap((locale) => [
        ...getBlogPosts(locale).map((post) => post.path),
        ...getLabNotes(locale).map((note) => note.path),
        ...getProjects(locale).map((project) => project.path)
      ])
      .map((path) => toPublicPath(path)),
    ...visible(pages).map((page) => toPublicPath(page.path)),
    ...getTagRoutes(locales)
  ]
}

export function getProject(path: string) {
  return projects.find((project) => project.path === path.toLowerCase())
}

export function getPage(path: string) {
  return pages.find((page) => page.path === path.toLowerCase())
}

export function getSurround<T extends { path: string }>(items: T[], path: string) {
  const index = items.findIndex((item) => item.path === path.toLowerCase())

  if (index < 0) {
    return []
  }

  return [items[index + 1] || null, items[index - 1] || null]
}
