import rehypeShiki from '@shikijs/rehype'
import { rehypeMermaidBlocks } from './velite/rehype-mermaid-blocks'
import {
  transformerNotationDiff,
  transformerNotationErrorLevel,
  transformerNotationFocus,
  transformerNotationHighlight,
  transformerNotationWordHighlight
} from '@shikijs/transformers'
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
  tags: s.array(s.string()).default([]),
  author: s.string().optional(),
  category: s.string().optional(),
  readingTime: s.string().optional(),
  thumbnailAlt: s.string().optional(),
  thumbnailCredit: s.string().optional(),
  series: s.string().optional(),
  summary: s.array(s.string()).optional()
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
  pattern: '*/{about,contact}.md',
  schema: s.object(baseContent).transform((data) => ({
    ...data,
    content: withHeadingIds(data.content, data.tocData),
    id: data.path.toLowerCase(),
    path: `/${data.path}`.toLowerCase()
  }))
})

export default defineConfig({
  collections: { blog, lab, projects, pages },
  markdown: {
    rehypePlugins: [
      rehypeMermaidBlocks,
      [
        // Velite bundles rehype plugins with incompatible @types — safe at runtime.
        rehypeShiki as never,
        {
          theme: 'github-dark',
          transformers: [
            transformerNotationDiff({ matchAlgorithm: 'v3' }),
            transformerNotationHighlight({ matchAlgorithm: 'v3' }),
            transformerNotationFocus({ matchAlgorithm: 'v3' }),
            transformerNotationErrorLevel({ matchAlgorithm: 'v3' }),
            transformerNotationWordHighlight({ matchAlgorithm: 'v3' })
          ]
        }
      ]
    ]
  }
})
