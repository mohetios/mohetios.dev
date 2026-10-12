import blogJson from '../../.velite/blog.json'
import labJson from '../../.velite/lab.json'
import pagesJson from '../../.velite/pages.json'
import projectsJson from '../../.velite/projects.json'
import { stripLocalePrefix, supportedLocales, withLocale } from '#locales'

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
  tags?: string[]
}

export type BlogPost = BaseContent & {
  description: string
  date: string
  status?: string
  featured?: boolean
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
}

export type Page = BaseContent
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
  featured: boolean
}

const visible = <T extends { draft?: boolean }>(items: T[]) => items.filter((item) => !item.draft)

const blog = visible(blogJson as BlogPost[])
const lab = visible(labJson as LabNote[])
const projects = visible(projectsJson as Project[])
const pages = visible(pagesJson as Page[])

/** Section index pages that exist in every locale. */
export const publicSections = ['/', '/blog', '/lab', '/projects', '/tags', '/about', '/contact']

const byDateDesc = <T extends { date?: string }>(items: T[]) =>
  [...items].sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())

function byActivityDesc<T extends { date?: string; updated?: string }>(items: T[]) {
  return [...items].sort(
    (a, b) =>
      new Date(b.updated || b.date || 0).getTime() - new Date(a.updated || a.date || 0).getTime()
  )
}

function inLocale<T extends { path: string }>(items: T[], locale: string, section: string) {
  return items.filter((item) => item.path.startsWith(`/${locale}/${section}/`))
}

const limitTo = <T>(items: T[], limit?: number) =>
  typeof limit === 'number' ? items.slice(0, limit) : items

const findByPath = <T extends { path: string }>(items: T[], path: string) => {
  const key = path.toLowerCase().replace(/(.)\/$/, '$1')

  return items.find((item) => item.path === key)
}

export const getBlogPosts = (locale: string, limit?: number) =>
  limitTo(byDateDesc(inLocale(blog, locale, 'blog')), limit)

export const getLabNotes = (locale: string, limit?: number) =>
  limitTo(byDateDesc(inLocale(lab, locale, 'lab')), limit)

export const getProjects = (locale: string, limit?: number) =>
  limitTo(byDateDesc(inLocale(projects, locale, 'projects')), limit)

export const getBlogPost = (path: string) => findByPath(blog, path)
export const getLabNote = (path: string) => findByPath(lab, path)
export const getProject = (path: string) => findByPath(projects, path)
export const getPage = (path: string) => findByPath(pages, path)

export const getContentEntry = (path: string) =>
  getBlogPost(path) || getLabNote(path) || getProject(path) || getPage(path)

export function getSurround<T extends { path: string }>(items: T[], path: string) {
  const index = items.findIndex((item) => item.path === path.toLowerCase())

  if (index < 0) {
    return []
  }

  return [items[index + 1] || null, items[index - 1] || null]
}

export const normalizeTagSlug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9؀-ۿ]+/g, '-')
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
    tagSlugs: tags.map(normalizeTagSlug).filter(Boolean),
    thumbnail: item.thumbnail,
    status: item.status,
    featured: item.featured === true
  }
}

export function getTaggedContent(locale: string) {
  return byActivityDesc([
    ...getBlogPosts(locale).map((post) => toTaggedContentItem(post, 'blog')),
    ...getLabNotes(locale).map((note) => toTaggedContentItem(note, 'lab')),
    ...getProjects(locale).map((project) => toTaggedContentItem(project, 'project'))
  ])
}

function getTagPaths(locale: string) {
  const slugs = new Set(getTaggedContent(locale).flatMap((item) => item.tagSlugs))

  return [...slugs].map((slug) => `/${locale}/tags/${slug}`)
}

/** Every public, indexable path with its last-modified date, for prerender and sitemap. */
export function getPublicEntries() {
  return supportedLocales.flatMap((locale) => [
    ...publicSections.map((section) => ({ path: withLocale(section, locale), lastmod: undefined })),
    ...[...getBlogPosts(locale), ...getLabNotes(locale), ...getProjects(locale)].map((item) => ({
      path: item.path,
      lastmod: item.updated || item.date
    })),
    ...getTagPaths(locale).map((path) => ({ path, lastmod: undefined }))
  ])
}

const publicPaths = new Set(getPublicEntries().map((entry) => entry.path))

/** The same page in another locale, or undefined when it was never translated. */
export function getTranslatedPath(path: string, locale: string) {
  const translated = withLocale(stripLocalePrefix(path.toLowerCase()), locale)

  return publicPaths.has(translated) ? translated : undefined
}
