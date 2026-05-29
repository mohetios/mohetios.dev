import { defineCollection, defineConfig, s } from 'velite'

const date = s.union([s.string(), s.date()]).transform((value) => new Date(value).toISOString())

type TocItem = {
  title: string
  url: string
  items?: TocItem[]
}

function flattenToc(items: TocItem[]): TocItem[] {
  return items.flatMap((item) => [item, ...flattenToc(item.items || [])])
}

function withHeadingIds(html: string, toc: TocItem[]) {
  const headings = flattenToc(toc)
  let index = 0

  return html.replace(/<h([2-6])>(.*?)<\/h\1>/g, (match, level, content) => {
    const heading = headings[index++]

    if (!heading?.url) {
      return match
    }

    return `<h${level} id="${heading.url.replace(/^#/, '')}">${content}</h${level}>`
  })
}

const baseContent = {
  title: s.string(),
  description: s.string(),
  updated: date.optional(),
  thumbnail: s.string().optional(),
  draft: s.boolean().default(false),
  path: s.path(),
  content: s.markdown(),
  raw: s.raw(),
  tocData: s.toc()
}

const writing = {
  ...baseContent,
  date,
  status: s.string().optional(),
  tags: s.array(s.string()).default([])
}

const blog = defineCollection({
  name: 'BlogPost',
  pattern: '*/blog/**/*.md',
  schema: s.object(writing).transform((data) => ({
    ...data,
    content: withHeadingIds(data.content, data.tocData),
    id: data.path.toLowerCase(),
    path: `/${data.path}`.toLowerCase()
  }))
})

const lab = defineCollection({
  name: 'LabNote',
  pattern: '*/lab/**/*.md',
  schema: s.object(writing).transform((data) => ({
    ...data,
    content: withHeadingIds(data.content, data.tocData),
    id: data.path.toLowerCase(),
    path: `/${data.path}`.toLowerCase()
  }))
})

const projects = defineCollection({
  name: 'Project',
  pattern: '*/projects/**/*.md',
  schema: s
    .object({
      ...writing,
      status: s.string(),
      repo: s.string().optional(),
      website: s.string().optional(),
      featured: s.boolean().default(false)
    })
    .transform((data) => ({
      ...data,
      content: withHeadingIds(data.content, data.tocData),
      id: data.path.toLowerCase(),
      path: `/${data.path}`.toLowerCase()
    }))
})

const pages = defineCollection({
  name: 'Page',
  pattern: '*/about.md',
  schema: s.object(baseContent).transform((data) => ({
    ...data,
    content: withHeadingIds(data.content, data.tocData),
    id: data.path.toLowerCase(),
    path: `/${data.path}`.toLowerCase()
  }))
})

export default defineConfig({
  collections: { blog, lab, projects, pages }
})
